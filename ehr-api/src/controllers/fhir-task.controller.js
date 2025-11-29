const taskService = require('../services/task.service');

/**
 * FHIR R4 Task Controller
 * Provides FHIR-compliant Task resource endpoints
 * Spec: https://www.hl7.org/fhir/task.html
 */

class FHIRTaskController {
  /**
   * Convert database task to FHIR R4 Task resource
   */
  static toFHIRResource(task) {
    const fhirTask = {
      resourceType: 'Task',
      id: task.id,
      identifier: task.identifier ? [{
        system: 'urn:ehr-connect:task',
        value: task.identifier
      }] : undefined,
      status: task.status,
      intent: task.intent,
      priority: task.priority,
      code: task.task_type ? {
        coding: [{
          system: 'http://hl7.org/fhir/CodeSystem/task-code',
          code: task.task_type,
          display: task.task_type
        }]
      } : undefined,
      description: task.description,
      focus: task.focus_reference ? {
        reference: task.focus_reference
      } : undefined,
      for: task.patient_id ? {
        reference: `Patient/${task.patient_id}`
      } : undefined,
      encounter: task.encounter_id ? {
        reference: `Encounter/${task.encounter_id}`
      } : undefined,
      executionPeriod: {
        start: task.created_at,
        end: task.completed_at || undefined
      },
      authoredOn: task.created_at,
      lastModified: task.updated_at,
      requester: task.created_by_user_id ? {
        reference: `Practitioner/${task.created_by_user_id}`
      } : undefined,
      owner: this._buildOwner(task),
      businessStatus: task.business_status ? {
        text: task.business_status
      } : undefined,
      note: task.notes ? [{
        text: task.notes
      }] : undefined,
      restriction: {
        period: {
          end: task.due_date
        }
      },
      meta: {
        versionId: task.version?.toString() || '1',
        lastUpdated: task.updated_at
      },
      extension: this._buildExtensions(task)
    };

    // Remove undefined fields
    return JSON.parse(JSON.stringify(fhirTask));
  }

  /**
   * Build owner reference (can be user, patient, or pool)
   */
  static _buildOwner(task) {
    if (task.assigned_to_user_id) {
      return {
        reference: `Practitioner/${task.assigned_to_user_id}`,
        display: task.assigned_to_user_name || undefined
      };
    } else if (task.assigned_to_patient_id) {
      return {
        reference: `Patient/${task.assigned_to_patient_id}`,
        display: task.assigned_to_patient_name || undefined
      };
    } else if (task.assigned_to_pool_id) {
      return {
        reference: `Group/${task.assigned_to_pool_id}`,
        display: task.assigned_to_pool_name || undefined
      };
    }
    return undefined;
  }

  /**
   * Build custom extensions for non-standard fields
   */
  static _buildExtensions(task) {
    const extensions = [];

    if (task.category) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-category',
        valueString: task.category
      });
    }

    if (task.labels && task.labels.length > 0) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-labels',
        valueString: task.labels.join(',')
      });
    }

    if (task.appointment_id) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-appointment',
        valueReference: {
          reference: `Appointment/${task.appointment_id}`
        }
      });
    }

    if (task.form_id) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-form',
        valueReference: {
          reference: `Questionnaire/${task.form_id}`
        }
      });
    }

    if (task.order_id) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-order',
        valueReference: {
          reference: `ServiceRequest/${task.order_id}`
        }
      });
    }

    if (!task.show_assignee) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-anonymous',
        valueBoolean: true
      });
    }

    if (task.metadata && Object.keys(task.metadata).length > 0) {
      extensions.push({
        url: 'http://ehr-connect.io/fhir/StructureDefinition/task-metadata',
        valueString: JSON.stringify(task.metadata)
      });
    }

    return extensions.length > 0 ? extensions : undefined;
  }

  /**
   * Convert FHIR Task resource to database format
   */
  static fromFHIRResource(fhirTask) {
    const task = {
      identifier: fhirTask.identifier?.[0]?.value,
      status: fhirTask.status,
      intent: fhirTask.intent || 'order',
      priority: fhirTask.priority || 'routine',
      task_type: fhirTask.code?.coding?.[0]?.code,
      description: fhirTask.description,
      business_status: fhirTask.businessStatus?.text,
      focus_reference: fhirTask.focus?.reference,
      patient_id: this._extractIdFromReference(fhirTask.for?.reference, 'Patient'),
      encounter_id: this._extractIdFromReference(fhirTask.encounter?.reference, 'Encounter'),
      notes: fhirTask.note?.[0]?.text,
      due_date: fhirTask.restriction?.period?.end,
      fhir_resource: fhirTask
    };

    // Parse owner
    if (fhirTask.owner?.reference) {
      const ownerRef = fhirTask.owner.reference;
      if (ownerRef.startsWith('Practitioner/')) {
        task.assigned_to_user_id = this._extractIdFromReference(ownerRef, 'Practitioner');
      } else if (ownerRef.startsWith('Patient/')) {
        task.assigned_to_patient_id = this._extractIdFromReference(ownerRef, 'Patient');
      } else if (ownerRef.startsWith('Group/')) {
        task.assigned_to_pool_id = this._extractIdFromReference(ownerRef, 'Group');
      }
    }

    // Parse extensions
    if (fhirTask.extension) {
      fhirTask.extension.forEach(ext => {
        if (ext.url.includes('task-category')) {
          task.category = ext.valueString;
        } else if (ext.url.includes('task-labels')) {
          task.labels = ext.valueString.split(',');
        } else if (ext.url.includes('task-appointment')) {
          task.appointment_id = this._extractIdFromReference(ext.valueReference?.reference, 'Appointment');
        } else if (ext.url.includes('task-form')) {
          task.form_id = this._extractIdFromReference(ext.valueReference?.reference, 'Questionnaire');
        } else if (ext.url.includes('task-order')) {
          task.order_id = this._extractIdFromReference(ext.valueReference?.reference, 'ServiceRequest');
        } else if (ext.url.includes('task-anonymous')) {
          task.show_assignee = !ext.valueBoolean;
        } else if (ext.url.includes('task-metadata')) {
          try {
            task.metadata = JSON.parse(ext.valueString);
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
    }

    return task;
  }

  /**
   * Extract ID from FHIR reference (e.g., "Patient/123" -> "123")
   */
  static _extractIdFromReference(reference, resourceType) {
    if (!reference) return null;
    const prefix = `${resourceType}/`;
    if (reference.startsWith(prefix)) {
      return reference.substring(prefix.length);
    }
    return reference;
  }

  /**
   * Build FHIR search parameters from query string
   */
  static buildSearchFilters(query, orgId) {
    const filters = { orgId };

    // FHIR search parameters
    if (query._id) {
      filters.id = query._id;
    }

    if (query.identifier) {
      filters.identifier = query.identifier;
    }

    if (query.status) {
      filters.status = query.status.split(',');
    }

    if (query.priority) {
      filters.priority = query.priority.split(',');
    }

    if (query.intent) {
      filters.intent = query.intent;
    }

    if (query.patient) {
      filters.patientId = this._extractIdFromReference(query.patient, 'Patient');
    }

    if (query.owner) {
      const ownerRef = query.owner;
      if (ownerRef.startsWith('Practitioner/')) {
        filters.assignedToUserId = this._extractIdFromReference(ownerRef, 'Practitioner');
      } else if (ownerRef.startsWith('Patient/')) {
        filters.assignedToPatientId = this._extractIdFromReference(ownerRef, 'Patient');
      } else if (ownerRef.startsWith('Group/')) {
        filters.assignedToPoolId = this._extractIdFromReference(ownerRef, 'Group');
      }
    }

    if (query.authored) {
      filters.dueAfter = query.authored;
    }

    if (query['authored-on']) {
      filters.dueAfter = query['authored-on'];
    }

    if (query.code) {
      filters.taskType = query.code;
    }

    if (query['business-status']) {
      filters.businessStatus = query['business-status'];
    }

    // Custom search parameters
    if (query.category) {
      filters.category = query.category;
    }

    if (query.labels) {
      filters.labels = query.labels.split(',');
    }

    if (query['due-before']) {
      filters.dueBefore = query['due-before'];
    }

    if (query['due-after']) {
      filters.dueAfter = query['due-after'];
    }

    if (query.overdue === 'true') {
      filters.isOverdue = true;
    }

    return filters;
  }

  /**
   * Build FHIR pagination parameters
   */
  static buildPagination(query) {
    return {
      limit: parseInt(query._count) || 50,
      offset: parseInt(query._offset) || 0,
      sortBy: query._sort || 'due_date',
      sortOrder: query._sort?.startsWith('-') ? 'DESC' : 'ASC'
    };
  }

  /**
   * Build FHIR Bundle for search results
   */
  static buildBundle(tasks, total, pagination, baseUrl) {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: total,
      link: [
        {
          relation: 'self',
          url: baseUrl
        }
      ],
      entry: tasks.map(task => ({
        fullUrl: `${baseUrl.split('?')[0]}/${task.id}`,
        resource: this.toFHIRResource(task),
        search: {
          mode: 'match'
        }
      }))
    };

    // Add pagination links
    const { limit, offset } = pagination;
    if (offset > 0) {
      const prevOffset = Math.max(0, offset - limit);
      bundle.link.push({
        relation: 'previous',
        url: `${baseUrl.split('?')[0]}?_count=${limit}&_offset=${prevOffset}`
      });
    }

    if (offset + limit < total) {
      const nextOffset = offset + limit;
      bundle.link.push({
        relation: 'next',
        url: `${baseUrl.split('?')[0]}?_count=${limit}&_offset=${nextOffset}`
      });
    }

    return bundle;
  }

  /**
   * Build FHIR OperationOutcome for errors
   */
  static buildOperationOutcome(severity, code, message) {
    return {
      resourceType: 'OperationOutcome',
      issue: [{
        severity: severity,
        code: code,
        diagnostics: message
      }]
    };
  }

  /**
   * Search Tasks (FHIR R4)
   * GET /fhir/R4/Task
   */
  static async search(req, res) {
    try {
      const filters = this.buildSearchFilters(req.query, req.user.org_id);
      const pagination = this.buildPagination(req.query);

      const result = await taskService.searchTasks(filters, pagination);

      const bundle = this.buildBundle(
        result.tasks,
        result.total,
        pagination,
        `${req.protocol}://${req.get('host')}${req.originalUrl}`
      );

      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(bundle);
    } catch (error) {
      console.error('FHIR Task search error:', error);
      res.status(500).json(
        this.buildOperationOutcome('error', 'exception', error.message)
      );
    }
  }

  /**
   * Read Task by ID (FHIR R4)
   * GET /fhir/R4/Task/:id
   */
  static async read(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id);

      if (!task) {
        return res.status(404).json(
          this.buildOperationOutcome('error', 'not-found', 'Task not found')
        );
      }

      // Check access (user's org)
      if (task.org_id !== req.user.org_id) {
        return res.status(403).json(
          this.buildOperationOutcome('error', 'forbidden', 'Access denied')
        );
      }

      const fhirTask = this.toFHIRResource(task);

      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(fhirTask);
    } catch (error) {
      console.error('FHIR Task read error:', error);
      res.status(500).json(
        this.buildOperationOutcome('error', 'exception', error.message)
      );
    }
  }

  /**
   * Create Task (FHIR R4)
   * POST /fhir/R4/Task
   */
  static async create(req, res) {
    try {
      const fhirTask = req.body;

      if (fhirTask.resourceType !== 'Task') {
        return res.status(400).json(
          this.buildOperationOutcome('error', 'invalid', 'Resource must be a Task')
        );
      }

      const taskData = {
        ...this.fromFHIRResource(fhirTask),
        orgId: req.user.org_id,
        createdByUserId: req.user.id
      };

      const task = await taskService.createTask(taskData, req.user.id);

      const createdFhirTask = this.toFHIRResource(task);

      res.setHeader('Content-Type', 'application/fhir+json');
      res.setHeader('Location', `${req.protocol}://${req.get('host')}/fhir/R4/Task/${task.id}`);
      res.status(201).json(createdFhirTask);
    } catch (error) {
      console.error('FHIR Task create error:', error);
      res.status(400).json(
        this.buildOperationOutcome('error', 'invalid', error.message)
      );
    }
  }

  /**
   * Update Task (FHIR R4)
   * PUT /fhir/R4/Task/:id
   */
  static async update(req, res) {
    try {
      const fhirTask = req.body;

      if (fhirTask.resourceType !== 'Task') {
        return res.status(400).json(
          this.buildOperationOutcome('error', 'invalid', 'Resource must be a Task')
        );
      }

      if (fhirTask.id && fhirTask.id !== req.params.id) {
        return res.status(400).json(
          this.buildOperationOutcome('error', 'invalid', 'Resource ID does not match URL')
        );
      }

      const updateData = this.fromFHIRResource(fhirTask);

      const task = await taskService.updateTask(
        req.params.id,
        updateData,
        req.user.id
      );

      const updatedFhirTask = this.toFHIRResource(task);

      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(updatedFhirTask);
    } catch (error) {
      console.error('FHIR Task update error:', error);
      res.status(400).json(
        this.buildOperationOutcome('error', 'invalid', error.message)
      );
    }
  }

  /**
   * Delete Task (FHIR R4)
   * DELETE /fhir/R4/Task/:id
   */
  static async delete(req, res) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user.id);

      if (!result.success) {
        return res.status(404).json(
          this.buildOperationOutcome('error', 'not-found', result.message)
        );
      }

      res.setHeader('Content-Type', 'application/fhir+json');
      res.status(200).json(
        this.buildOperationOutcome('information', 'deleted', 'Task deleted successfully')
      );
    } catch (error) {
      console.error('FHIR Task delete error:', error);
      res.status(500).json(
        this.buildOperationOutcome('error', 'exception', error.message)
      );
    }
  }
}

module.exports = FHIRTaskController;
