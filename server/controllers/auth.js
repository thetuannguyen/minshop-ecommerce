const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");

const { sendMail } = require("../services/nodemailer");

const { authValidation } = require("../validation");

const User = require("../models/User");

// đăng ký
const register = async (req, res) => {
  try {
    const { isValid, errors } = authValidation.register(req.body);
    if (!isValid) {
      return res.status(400).json({ errors: errors });
    } else {
      const { name, email, password, phone } = req.body;
      // check is user da ton tai chua
      const userByEmail = await User.findOne({ email });

      if (!userByEmail) {
        const hashPassword = await argon2.hash(password);

        const verifyToken = v4();

        const newUser = new User({
          name,
          email,
          password: hashPassword,
          phone,
          verifyToken,
        });

        // send mail verify
        sendMail(
          email,
          "verify account",
          `<a href="http://${process.env.CLIENT_URI}/verify/${verifyToken}"> Click to verify account</a>`
        );

        // luu user
        await newUser.save();

        res.json({ newUser });
      } else {
        res.status(400).json({
          errors: [{ field: "email", message: "Tài khoản đã tồn tại" }],
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// xác thực người dùng
const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOneAndUpdate(
      { verifyToken: token },
      { isVerify: true, verifyToken: "" },
      { new: true }
    );
    if (!user) return res.status(400).json({ success: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

// đăng nhập
const login = async (req, res) => {
  try {
    const { isValid, errors } = authValidation.login(req.body);
    if (!isValid) {
      return res.status(400).json({ errors: errors });
    } else {
      const { email, password } = req.body;

      const userByEmail = await User.findOne({ email });

      if (userByEmail) {
        if (!userByEmail.isVerify) {
          return res.status(400).json({
            errors: [
              {
                field: "verify",
                message: "Tài khoản chưa được xác thực, hãy kiểm tra email",
              },
            ],
          });
        }

        if (!userByEmail.isActive) {
          return res.status(400).json({
            errors: [
              {
                field: "active",
                message: "Tài khoản đã bị khóa",
              },
            ],
          });
        }

        const matchPassword = await argon2.verify(
          userByEmail.password,
          password
        );
        if (matchPassword) {
          const { _id, name, role, phone, birthday, gender } = userByEmail;
          const payload = {
            id: _id,
            name,
            email,
            phone,
            birthday,
            gender,
            role,
          };
          const token = await jwt.sign(payload, process.env.SECRET_OR_KEY, {
            expiresIn: "24h",
          });

          res.json({ token: `Bearer ${token}` });
        } else {
          return res.status(400).json({
            errors: [
              { field: "password", message: "Mật khẩu không chính xác" },
            ],
          });
        }
      } else {
        return res.status(400).json({
          errors: [{ field: "email", message: "Tài khoản không tồn tại" }],
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const resetPasswordToken = v4();

    const user = await User.findOneAndUpdate(
      { email },
      { resetPasswordToken },
      { new: true }
    );

    if (user)
      // send mail change password
      sendMail(
        email,
        "change password account",
        `
        <div>Bạn vui lòng click vào đường dẫn bên dưới để đổi password của bạn</div>
        <a href="http://${process.env.CLIENT_URI}/change-password/${resetPasswordToken}">change password</a>
        `
      );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// thay đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await User.findOneAndUpdate(
      { resetPasswordToken: token },
      {
        password: await argon2.hash(password),
        resetPasswordToken: "",
      },
      { new: true }
    );

    res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// đăng nhập bằng Google
const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log(req.body);
    const userByEmail = await User.findOne({ email, provider: "google" });
    if (!userByEmail) {
      console.log("1");
      let newUser = new User({
        email,
        name,
        provider: "google",
        isVerify: true,
      });
      const { _id, role, phone, birthday, gender } = newUser;
      const payload = {
        id: _id,
        name,
        email,
        phone,
        birthday,
        gender,
        role,
      };

      const token = await jwt.sign(payload, process.env.SECRET_OR_KEY, {
        expiresIn: "24h",
      });

      await newUser.save();

      return res.json({ token: `Bearer ${token}` });
    }

    if (!userByEmail.isActive) {
      return res.status(400).json({
        errors: [
          {
            field: "active",
            message: "Tài khoản đã bị khóa",
          },
        ],
      });
    }

    const { _id, role, phone, birthday, gender } = userByEmail;
    const payload = {
      id: _id,
      name,
      email,
      phone,
      birthday,
      gender,
      role,
    };
    const token = await jwt.sign(payload, process.env.SECRET_OR_KEY, {
      expiresIn: "24h",
    });

    res.json({ token: `Bearer ${token}` });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  login,
  register,
  verifyUser,
  forgotPassword,
  changePassword,
  googleLogin,
};
