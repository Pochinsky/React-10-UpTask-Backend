import jwt from "jsonwebtoken";
import Types from "mongoose";

type UserPayloadType = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: UserPayloadType) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "180d",
  });
  return token;
};
