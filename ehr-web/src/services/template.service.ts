import { medplum } from '@/lib/medplum';

export interface ClinicalTemplate {
  id: string;
  name: string;
  category: 'chief-complaint' | 'findings' | 'investigation' | 'diagnosis' | 'clinical-notes' | 'instructions';
  content: string;
  tags?: string[];
  usageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing clinical note templates
 * Templates are stored as FHIR Questionnaire resources
 */
export class TemplateService {
  /**
   * Get all templates by category
   */
  static async getTemplatesByCategory(category: ClinicalTemplate['category']): Promise<ClinicalTemplate[]> {
    try {
      console.log(`📋 Loading templates for category: ${category}`);

      // Get all active Questionnaires (since tag search might not work)
      const questionnaires = await medplum.searchResources('Questionnaire', {
        status: 'active'
      });

      console.log(`📋 Found ${questionnaires.length} total questionnaires`);

      // Filter by category using extension (more reliable than tags)
      const filtered = questionnaires.filter((q: any) => {
        const categoryExt = q.extension?.find((ext: any) => ext.url === 'category');
        const templateCategory = categoryExt?.valueString;

        // Also check meta tags as fallback
        const tags = q.meta?.tag || [];
        const hasMatchingTag = tags.some((tag: any) => tag.code === `template-${category}`);

        const matches = templateCategory === category || hasMatchingTag;

        if (!matches) {
          console.log(`⚠️ Skipping template "${q.title}" - category: ${templateCategory}, expected: ${category}`);
        }

        return matches;
      });

      console.log(`📋 After filtering: ${filtered.length} templates match category: ${category}`);

      return filtered.map((q: any) => ({
        id: q.id,
        name: q.title || 'Untitled Template',
        category: category,
        content: q.description || '',
        tags: q.useContext?.map((uc: any) => uc.valueCodeableConcept?.text).filter(Boolean) || [],
        usageCount: q.extension?.find((ext: any) => ext.url === 'usageCount')?.valueInteger || 0,
        createdAt: new Date(q.meta?.lastUpdated || q.date || new Date()),
        updatedAt: new Date(q.meta?.lastUpdated || new Date())
      }));
    } catch (error) {
      console.error(`Error loading templates for ${category}:`, error);
      return [];
    }
  }

  /**
   * Create a new template
   */
  static async createTemplate(template: Omit<ClinicalTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalTemplate> {
    try {
      console.log(`📋 Creating template with category: ${template.category}`, template);

      const categoryTag = `template-${template.category}`;
      console.log(`📋 Setting category tag: ${categoryTag}`);

      // First, create the questionnaire without tags
      const questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: template.name,
        description: template.content,
        useContext: template.tags?.map(tag => ({
          code: {
            system: 'http://terminology.hl7.org/CodeSystem/usage-context-type',
            code: 'workflow',
            display: 'Workflow Setting'
          },
          valueCodeableConcept: {
            text: tag
          }
        })),
        extension: [
          {
            url: 'usageCount',
            valueInteger: template.usageCount || 0
          },
          {
            url: 'category',
            valueString: template.category
          }
        ],
        date: new Date().toISOString()
      };

      const created = await medplum.createResource(questionnaire as any);
      console.log(`✅ Template created with ID: ${created.id}`);

      // Now add the tag using PATCH
      try {
        const patchOps = [
          {
            op: 'add',
            path: '/meta',
            value: {
              tag: [{
                system: 'http://terminology.hl7.org/CodeSystem/common-tags',
                code: categoryTag,
                display: `${template.category} template`
              }]
            }
          }
        ];

        await medplum.patchResource('Questionnaire', created.id!, patchOps);
        console.log(`✅ Template tags added via PATCH: ${categoryTag}`);
      } catch (patchError) {
        console.error('⚠️ Failed to add tags via PATCH, using extension fallback', patchError);
        // Tags failed, but we have category in extension as fallback
      }

      return {
        id: created.id!,
        name: template.name,
        category: template.category,
        content: template.content,
        tags: template.tags,
        usageCount: template.usageCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update a template
   */
  static async updateTemplate(id: string, updates: Partial<ClinicalTemplate>): Promise<void> {
    try {
      const patchOps = [];

      if (updates.name) {
        patchOps.push({ op: 'replace', path: '/title', value: updates.name });
      }

      if (updates.content !== undefined) {
        patchOps.push({ op: 'replace', path: '/description', value: updates.content });
      }

      if (updates.tags) {
        patchOps.push({
          op: 'replace',
          path: '/useContext',
          value: updates.tags.map(tag => ({
            code: {
              system: 'http://terminology.hl7.org/CodeSystem/usage-context-type',
              code: 'workflow',
              display: 'Workflow Setting'
            },
            valueCodeableConcept: { text: tag }
          }))
        });
      }

      if (patchOps.length > 0) {
        await medplum.patchResource('Questionnaire', id, patchOps);
        console.log(`✅ Template ${id} updated`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    try {
      await medplum.deleteResource('Questionnaire', id);
      console.log(`✅ Template ${id} deleted`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Increment usage count for a template
   */
  static async incrementUsageCount(id: string): Promise<void> {
    try {
      const template = await medplum.readResource('Questionnaire', id);
      const currentCount = (template as any).extension?.find((ext: any) => ext.url === 'usageCount')?.valueInteger || 0;

      const extensions = (template as any).extension || [];
      const usageCountIndex = extensions.findIndex((ext: any) => ext.url === 'usageCount');

      if (usageCountIndex >= 0) {
        extensions[usageCountIndex].valueInteger = currentCount + 1;
      } else {
        extensions.push({ url: 'usageCount', valueInteger: 1 });
      }

      await medplum.patchResource('Questionnaire', id, [
        { op: 'replace', path: '/extension', value: extensions }
      ]);

      console.log(`✅ Incremented usage count for template ${id}: ${currentCount + 1}`);
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  /**
   * Get popular templates (most used)
   */
  static async getPopularTemplates(category: ClinicalTemplate['category'], limit: number = 10): Promise<ClinicalTemplate[]> {
    try {
      const templates = await this.getTemplatesByCategory(category);
      return templates
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error loading popular templates:', error);
      return [];
    }
  }

  /**
   * Search templates by keyword
   */
  static async searchTemplates(category: ClinicalTemplate['category'], keyword: string): Promise<ClinicalTemplate[]> {
    try {
      const templates = await this.getTemplatesByCategory(category);
      const lowerKeyword = keyword.toLowerCase();

      return templates.filter(t =>
        t.name.toLowerCase().includes(lowerKeyword) ||
        t.content.toLowerCase().includes(lowerKeyword) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    } catch (error) {
      console.error('Error searching templates:', error);
      return [];
    }
  }

  /**
   * Initialize default templates (call once on first setup)
   */
  static async initializeDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates: Array<Omit<ClinicalTemplate, 'id' | 'createdAt' | 'updatedAt'>> = [
        // Chief Complaints
        {
          name: 'Toothache',
          category: 'chief-complaint',
          content: 'Patient presents with toothache in the [location] region for [duration]. Pain is described as [sharp/dull/throbbing]. Aggravating factors: [hot/cold/pressure]. Associated symptoms: [swelling/bleeding/sensitivity].',
          tags: ['dental', 'pain', 'common']
        },
        {
          name: 'Dental Checkup',
          category: 'chief-complaint',
          content: 'Patient presents for routine dental checkup and cleaning. No specific complaints. Last visit: [date].',
          tags: ['dental', 'preventive', 'routine']
        },
        {
          name: 'Cavity Concern',
          category: 'chief-complaint',
          content: 'Patient reports concern about possible cavity on tooth #[number]. Noticed [sensitivity/discoloration/visible hole] for [duration].',
          tags: ['dental', 'cavity', 'common']
        },
        {
          name: 'Gum Bleeding',
          category: 'chief-complaint',
          content: 'Patient presents with bleeding gums during [brushing/flossing/spontaneously]. Duration: [timeframe]. Associated with [pain/swelling/bad breath].',
          tags: ['dental', 'periodontal', 'common']
        },

        // Findings
        {
          name: 'Normal Oral Examination',
          category: 'findings',
          content: 'Oral mucosa: pink and healthy. Gingiva: no inflammation or bleeding. Teeth: no visible caries or fractures. Occlusion: normal. Tongue: normal appearance and mobility.',
          tags: ['normal', 'comprehensive']
        },
        {
          name: 'Dental Caries',
          category: 'findings',
          content: 'Tooth #[number]: [small/moderate/extensive] carious lesion on [occlusal/mesial/distal/buccal/lingual] surface. Depth: [enamel/dentin/near pulp]. No percussion sensitivity. Vitality: [positive/negative].',
          tags: ['caries', 'cavity', 'common']
        },
        {
          name: 'Gingivitis',
          category: 'findings',
          content: 'Generalized marginal gingival inflammation. Bleeding on probing: [mild/moderate/severe]. Calculus: [minimal/moderate/heavy]. Pocket depth: [measurement] mm. No mobility.',
          tags: ['periodontal', 'gingival', 'common']
        },

        // Investigations
        {
          name: 'Intraoral X-ray',
          category: 'investigation',
          content: 'Periapical radiograph of tooth #[number] shows [findings]. Bone level: [normal/mild/moderate/severe] bone loss. PDL space: [normal/widened]. Periapical area: [normal/radiolucency noted].',
          tags: ['radiology', 'x-ray', 'common']
        },
        {
          name: 'Vitality Test',
          category: 'investigation',
          content: 'Pulp vitality test performed on tooth #[number] using [cold/electric pulp tester]. Response: [positive/negative/delayed]. Compared to adjacent teeth: [similar/different].',
          tags: ['diagnostic', 'vitality', 'common']
        },

        // Diagnosis
        {
          name: 'Dental Caries',
          category: 'diagnosis',
          content: 'Dental caries on tooth #[number], [surface]. ICD-10: K02.[specify]. Treatment plan: [restoration/root canal/extraction].',
          tags: ['caries', 'common']
        },
        {
          name: 'Chronic Gingivitis',
          category: 'diagnosis',
          content: 'Chronic gingivitis, generalized. ICD-10: K05.10. Recommendation: improved oral hygiene, professional cleaning, possible periodontal therapy.',
          tags: ['periodontal', 'gingival', 'common']
        },
        {
          name: 'Dental Abscess',
          category: 'diagnosis',
          content: 'Periapical abscess of tooth #[number]. ICD-10: K04.7. Requires: drainage, root canal therapy or extraction, antibiotic therapy.',
          tags: ['infection', 'emergency', 'abscess']
        },

        // Clinical Notes
        {
          name: 'Post-Extraction Care',
          category: 'clinical-notes',
          content: 'Patient tolerated extraction well. Hemostasis achieved. Post-op instructions given: bite on gauze for 30 min, no rinsing/spitting for 24h, soft diet, ice pack application, pain management as prescribed.',
          tags: ['post-operative', 'extraction', 'instructions']
        },
        {
          name: 'Root Canal Progress',
          category: 'clinical-notes',
          content: 'Root canal therapy on tooth #[number]. Access cavity prepared. Canals located: [number]. Working length established. Canals cleaned and shaped to [size]. Medication placed: [type]. Temporary restoration placed.',
          tags: ['endodontic', 'root-canal', 'procedure']
        },

        // Instructions
        {
          name: 'Post-Operative Instructions',
          category: 'instructions',
          content: 'Take prescribed medications as directed. Apply ice pack 20 min on/off for first 24h. Soft diet for 2-3 days. No smoking/alcohol. Gentle oral hygiene. Call if severe pain, excessive bleeding, or fever develops. Follow-up in [timeframe].',
          tags: ['post-operative', 'general', 'common']
        },
        {
          name: 'Oral Hygiene Instructions',
          category: 'instructions',
          content: 'Brush twice daily with fluoride toothpaste for 2 minutes. Floss daily. Use mouthwash if recommended. Limit sugary foods/drinks. Schedule regular dental checkups every 6 months.',
          tags: ['preventive', 'hygiene', 'education']
        }
      ];

      console.log('📋 Initializing default templates...');

      for (const template of defaultTemplates) {
        try {
          await this.createTemplate(template);
        } catch (error) {
          console.error(`Failed to create template: ${template.name}`, error);
        }
      }

      console.log('✅ Default templates initialized');
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }
}
