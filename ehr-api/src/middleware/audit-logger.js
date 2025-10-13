const auditService = require('../services/audit.service');

const DEFAULT_IGNORED_PATHS = ['/health'];

function auditLogger(options = {}) {
  const ignoredPaths = options.ignoredPaths || DEFAULT_IGNORED_PATHS;

  return (req, res, next) => {
    const pathMatches = ignoredPaths.some(path => req.path.startsWith(path));
    if (pathMatches) {
      return next();
    }

    const startTime = process.hrtime.bigint();

    const orgId = req.headers['x-org-id'] || null;
    const actorUserId = req.headers['x-user-id'] || null;
    const sessionId = req.headers['x-session-id'] || null;
    const requestId = req.headers['x-request-id'] || null;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;
    const userAgent = req.headers['user-agent'] || null;

    req.auditContext = {
      orgId,
      actorUserId,
      sessionId,
      ipAddress,
      userAgent,
      requestId
    };

    req.audit = {
      log: (event) => auditService.logEvent({
        orgId: event.orgId || orgId,
        actorUserId: event.actorUserId || actorUserId,
        targetType: event.targetType,
        targetId: event.targetId,
        targetName: event.targetName,
        action: event.action,
        status: event.status,
        errorMessage: event.errorMessage,
        metadata: event.metadata,
        category: event.category,
        ipAddress: event.ipAddress || ipAddress,
        userAgent: event.userAgent || userAgent,
        sessionId: event.sessionId || sessionId,
        requestId: event.requestId || requestId,
        before: event.before,
        after: event.after
      }, { client: event.client, skipSettingsCheck: event.skipSettingsCheck }),
      computeChanges: auditService.computeChanges.bind(auditService),
      getSettings: () => auditService.getSettings(orgId)
    };

    res.on('finish', () => {
      const elapsed = process.hrtime.bigint() - startTime;
      const durationMs = Number(elapsed) / 1e6;

      auditService.logHttpRequest({
        orgId,
        actorUserId,
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: res.statusCode,
        durationMs,
        requestBody: shouldCaptureBody(req.method) ? req.body : undefined,
        responseBody: undefined,
        ipAddress,
        userAgent,
        sessionId,
        requestId
      }).catch(err => {
        console.error('Failed to log HTTP request audit event:', err);
      });
    });

    next();
  };
}

function shouldCaptureBody(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method?.toUpperCase());
}

module.exports = auditLogger;
