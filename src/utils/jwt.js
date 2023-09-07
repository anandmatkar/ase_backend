const jsonwebtoken = require("jsonwebtoken");
const connection = require('../database/connection')

const jwt = {
    //create token
    issueJWT: async (user, position) => {
        let payload = {
            id: user.id,
            email: user.email_address,
            position: position
        };
        const jwtToken = jsonwebtoken.sign(payload, 'KEy')
        return jwtToken;
    },
    
    verifyTokenAdmin: async (req, res, next) => {
        var token = req.headers.authorization
        jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                if (decoded.position != 'Admin') {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized",
                    });
                } else {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        position: decoded.position
                    }
                    return next();
                }
            }
        });
    },
    verifyTokenManager: async (req, res, next) => {
        var token = req.headers.authorization
        jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                if (decoded.position != 'Manager') {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized",
                    });
                } else {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        position: decoded.position
                    }
                    return next();
                }
            }
        });
    },
    verifyTokenTechnician: async (req, res, next) => {
        var token = req.headers.authorization
        jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                if (decoded.position != 'Technician') {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized",
                    });
                } else {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        position: decoded.position
                    }
                    return next();
                }
            }
        });
    },
    verifyTokenManagerORTechnician: async (req, res, next) => {
        var token = req.headers.authorization
        jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                console.log(decoded.position)
                if (decoded.position == 'Manager' || decoded.position == 'Technician') {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        position: decoded.position
                    }
                    return next();
                } else {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized",
                    });
                }
            }
        });
    }

};
module.exports = jwt;