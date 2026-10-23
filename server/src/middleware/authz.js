// server/src/middleware/authz.js

// 1. Valida si el rol del usuario está en la lista permitida (RBAC)
export const requireRole = (...roles) => (req, res, next) =>
    roles.includes(req.user.role) ? next()
        : res.status(403).json({ error: 'No autorizado' }); // 403 = prohibido

// 2. Valida si el usuario es dueño del registro o si es ADMIN (Ownership)
export const requireOwnership = (cargar, campo = 'created_by') =>
    (req, res, next) => {
        const rec = cargar(Number(req.params.id));
        if (!rec) return res.status(404).json({ error: 'No encontrado' }); // 404
        if (req.user.role === 'ADMIN' || rec[campo] === req.user.id) return next();
        return res.status(403).json({ error: 'No autorizado' }); // 403 = prohibido
    };
