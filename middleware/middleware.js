const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: true, msg: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: true, msg: 'Unauthorized: Token expired' });
            }
            return res.status(401).json({ error: true, msg: 'Unauthorized: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = authenticateUser;

