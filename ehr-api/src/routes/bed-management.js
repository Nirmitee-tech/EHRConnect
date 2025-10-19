const express = require('express');
const router = express.Router();
const bedManagementService = require('../services/bed-management');

/**
 * Middleware to require organization context
 * Matches the pattern used by inventory module
 * Only requires x-org-id, x-user-id is optional
 */
function requireOrgContext(req, res, next) {
  const orgId = req.headers['x-org-id'];
  if (!orgId) {
    return res.status(400).json({
      error: 'Organization context (x-org-id) is required'
    });
  }

  req.orgId = orgId;
  req.userId = req.headers['x-user-id'] || null;
  next();
}

// All routes require organization context
router.use(requireOrgContext);

// =====================================================
// WARD ROUTES
// =====================================================

/**
 * GET /api/bed-management/wards
 * Get all wards
 */
router.get('/wards', async (req, res) => {
  try {
    const { locationId, active, wardType } = req.query;
    const orgId = req.orgId;

    const filters = {};
    if (locationId) filters.locationId = locationId;
    if (active !== undefined) filters.active = active === 'true';
    if (wardType) filters.wardType = wardType;

    const wards = await bedManagementService.getWards(orgId, locationId, filters);

    res.json({
      success: true,
      data: wards
    });
  } catch (error) {
    console.error('Error fetching wards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wards'
    });
  }
});

/**
 * GET /api/bed-management/wards/:id
 * Get a specific ward
 */
router.get('/wards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;

    const ward = await bedManagementService.getWardById(id, orgId);

    if (!ward) {
      return res.status(404).json({
        success: false,
        error: 'Ward not found'
      });
    }

    res.json({
      success: true,
      data: ward
    });
  } catch (error) {
    console.error('Error fetching ward:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ward'
    });
  }
});

/**
 * POST /api/bed-management/wards
 * Create a new ward
 */
router.post('/wards', async (req, res) => {
  try {
    const orgId = req.orgId;
    const userId = req.userId;
    const wardData = req.body;

    const ward = await bedManagementService.createWard(orgId, userId, wardData);

    res.status(201).json({
      success: true,
      data: ward
    });
  } catch (error) {
    console.error('Error creating ward:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Ward code already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create ward'
    });
  }
});

/**
 * PUT /api/bed-management/wards/:id
 * Update a ward
 */
router.put('/wards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;
    const userId = req.userId;
    const wardData = req.body;

    const ward = await bedManagementService.updateWard(id, orgId, userId, wardData);

    res.json({
      success: true,
      data: ward
    });
  } catch (error) {
    console.error('Error updating ward:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update ward'
    });
  }
});

// =====================================================
// BED ROUTES
// =====================================================

/**
 * GET /api/bed-management/beds
 * Get all beds with filters
 */
router.get('/beds', async (req, res) => {
  try {
    const { locationId, wardId, status, bedType, active } = req.query;
    const orgId = req.orgId;

    const filters = {};
    if (locationId) filters.locationId = locationId;
    if (wardId) filters.wardId = wardId;
    if (status) filters.status = status;
    if (bedType) filters.bedType = bedType;
    if (active !== undefined) filters.active = active === 'true';

    const beds = await bedManagementService.getBeds(orgId, filters);

    res.json({
      success: true,
      data: beds
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beds'
    });
  }
});

/**
 * GET /api/bed-management/beds/:id
 * Get a specific bed
 */
router.get('/beds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;

    const bed = await bedManagementService.getBedById(id, orgId);

    if (!bed) {
      return res.status(404).json({
        success: false,
        error: 'Bed not found'
      });
    }

    res.json({
      success: true,
      data: bed
    });
  } catch (error) {
    console.error('Error fetching bed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bed'
    });
  }
});

/**
 * POST /api/bed-management/beds
 * Create a new bed
 */
router.post('/beds', async (req, res) => {
  try {
    const orgId = req.orgId;
    const userId = req.userId;
    const bedData = req.body;

    const bed = await bedManagementService.createBed(orgId, userId, bedData);

    res.status(201).json({
      success: true,
      data: bed
    });
  } catch (error) {
    console.error('Error creating bed:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Bed number already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create bed'
    });
  }
});

/**
 * PATCH /api/bed-management/beds/:id/status
 * Update bed status
 */
router.patch('/beds/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const orgId = req.orgId;
    const userId = req.userId;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const bed = await bedManagementService.updateBedStatus(id, orgId, userId, status, notes);

    res.json({
      success: true,
      data: bed
    });
  } catch (error) {
    console.error('Error updating bed status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update bed status'
    });
  }
});

// =====================================================
// HOSPITALIZATION ROUTES
// =====================================================

/**
 * GET /api/bed-management/hospitalizations
 * Get all hospitalizations
 */
router.get('/hospitalizations', async (req, res) => {
  try {
    const { locationId, status, wardId, attendingDoctorId, patientId } = req.query;
    const orgId = req.orgId;

    const filters = {};
    if (locationId) filters.locationId = locationId;
    if (status) {
      // Support multiple statuses
      filters.status = status.includes(',') ? status.split(',') : status;
    }
    if (wardId) filters.wardId = wardId;
    if (attendingDoctorId) filters.attendingDoctorId = attendingDoctorId;
    if (patientId) filters.patientId = patientId;

    const hospitalizations = await bedManagementService.getHospitalizations(orgId, filters);

    res.json({
      success: true,
      data: hospitalizations
    });
  } catch (error) {
    console.error('Error fetching hospitalizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitalizations'
    });
  }
});

/**
 * GET /api/bed-management/hospitalizations/:id
 * Get a specific hospitalization
 */
router.get('/hospitalizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;

    const hospitalization = await bedManagementService.getHospitalizationById(id, orgId);

    if (!hospitalization) {
      return res.status(404).json({
        success: false,
        error: 'Hospitalization not found'
      });
    }

    res.json({
      success: true,
      data: hospitalization
    });
  } catch (error) {
    console.error('Error fetching hospitalization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitalization'
    });
  }
});

/**
 * POST /api/bed-management/admissions
 * Admit a patient
 */
router.post('/admissions', async (req, res) => {
  try {
    const orgId = req.orgId;
    const userId = req.userId;
    const admissionData = req.body;

    const hospitalization = await bedManagementService.admitPatient(orgId, userId, admissionData);

    res.status(201).json({
      success: true,
      data: hospitalization
    });
  } catch (error) {
    console.error('Error admitting patient:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to admit patient'
    });
  }
});

/**
 * POST /api/bed-management/hospitalizations/:id/assign-bed
 * Assign bed to hospitalization
 */
router.post('/hospitalizations/:id/assign-bed', async (req, res) => {
  try {
    const { id } = req.params;
    const { bedId, notes } = req.body;
    const orgId = req.orgId;
    const userId = req.userId;

    if (!bedId) {
      return res.status(400).json({
        success: false,
        error: 'Bed ID is required'
      });
    }

    await bedManagementService.assignBed(orgId, userId, id, bedId, notes);

    res.json({
      success: true,
      message: 'Bed assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning bed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign bed'
    });
  }
});

/**
 * POST /api/bed-management/hospitalizations/:id/discharge
 * Discharge a patient
 */
router.post('/hospitalizations/:id/discharge', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;
    const userId = req.userId;
    const dischargeData = req.body;

    const hospitalization = await bedManagementService.dischargePatient(orgId, userId, id, dischargeData);

    res.json({
      success: true,
      data: hospitalization
    });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discharge patient'
    });
  }
});

// =====================================================
// ANALYTICS & DASHBOARD ROUTES
// =====================================================

/**
 * GET /api/bed-management/analytics/occupancy
 * Get bed occupancy statistics
 */
router.get('/analytics/occupancy', async (req, res) => {
  try {
    const { locationId } = req.query;
    const orgId = req.orgId;

    const stats = await bedManagementService.getBedOccupancyStats(orgId, locationId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching occupancy stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch occupancy statistics'
    });
  }
});

/**
 * GET /api/bed-management/analytics/ward-occupancy
 * Get ward-wise occupancy data
 */
router.get('/analytics/ward-occupancy', async (req, res) => {
  try {
    const { locationId } = req.query;
    const orgId = req.orgId;

    const data = await bedManagementService.getWardOccupancy(orgId, locationId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching ward occupancy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ward occupancy'
    });
  }
});

/**
 * GET /api/bed-management/analytics/summary
 * Get hospitalization summary
 */
router.get('/analytics/summary', async (req, res) => {
  try {
    const { locationId } = req.query;
    const orgId = req.orgId;

    const summary = await bedManagementService.getHospitalizationSummary(orgId, locationId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching hospitalization summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary'
    });
  }
});

module.exports = router;
