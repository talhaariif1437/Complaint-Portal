const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    // Get token from headers
    const token = req.headers.authorization;

    
    if (!token) {
        return res.status(401).send({ error: true, message: 'Unauthorized: No token provided' });
    }

    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'Unauthorized: Invalid token' });
        }
        // Set decoded user information to req.user
        req.user = decoded;
        next();
    });
};

module.exports = authenticateUser;
