export const isManager = (req, res, next) => {
    if (req.user && req.user.role === 'Manager') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
};

export const isApproved = (req, res, next) => {
    if (req.user && req.user.roomStatus === 'Approved') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You must be an approved member of a room.' });
    }
};
