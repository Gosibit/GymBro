import express from 'express'

const Admin = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.user.role !== 'Admin') return res.status(403).json('Permission denied')
    next()
}

export default Admin
