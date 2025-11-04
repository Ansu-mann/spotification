const adminMiddleware = async (req, res, next) => {
    const {role} = req.userInfo;
    if(role !== 'admin'){
        return res.status(401).json({
            success: false,
            message: 'Admin permissions required'
        })
    }
    next();
}

module.exports = adminMiddleware;