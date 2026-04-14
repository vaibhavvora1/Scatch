const Joi = require("joi");

module.exports.validateUser = function () {
  // schema define (keep it outside route - reusable)
  const userSchema = Joi.object({
    //validation schema
    fullname: Joi.string().min(3).required(), //fullname validation
    email: Joi.string().email().required(), //email validation
    //password validation
    password: Joi.string().min(5).required(),
  });

  // ✅ STEP 1: validate
  const { error } = userSchema.validate(req.body); //validate request body

  if (error) {
    return res.status(400).send(error.details[0].message); //send error message
  }

  return userSchema;
};
