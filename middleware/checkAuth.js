import Jwt from 'jsonwebtoken';
import User from '../models/User.js';
 
const checkAuth = async (req, res, next) => {
  let token;
 
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
 
      const decoded = Jwt.verify(token, process.env.JWT_SECRET);
 
      req.user = await User.findById(decoded.id).select('-password -confirmed -token -createdAt -updateAt -__v');
 
      return next();
    } catch (error) {
      console.log(error);
      return res.status(404).json({ msg: 'there was an error' });
    }
    }
 
  if (!token) {
    const error = new Error('Invalid Token');
    return res.status(401).json({ msg: error.message });
    }
 
  next();
};
 
export default checkAuth;