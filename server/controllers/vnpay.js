let dateFormat = require("dateformat");
let sha256 = require("sha256");
let querystring = require("qs");

let test = (req, res) => {
  res.send("Test vnpay route");
};

// tạo url thanh toán
let postCreatePaymentUrl = (req, res) => {
  try {
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = "1SNJ89L8";
    let secretKey = "ODJLXOCEWMFIEJXHJNMZUVFFVRDDXLOT";
    let vnpUrl = "http://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = "http://localhost:3000/payment/check";

    let date = new Date();
    let createDate = dateFormat(date, "yyyymmddHHmmss");
    let orderId = dateFormat(date, "HHmmss");
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let orderInfo = req.body.orderDescription;
    let orderType = req.body.orderType;
    let locale = req.body.language;
    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData =
      secretKey + querystring.stringify(vnp_Params, { encode: false });

    let secureHash = sha256(signData);

    vnp_Params["vnp_SecureHashType"] = "SHA256";
    vnp_Params["vnp_SecureHash"] = secureHash;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: true });

    //Neu muon dung Redirect thi dong dong ben duoi
    res.status(200).json({ code: "00", data: vnpUrl });
    //Neu muon dung Redirect thi mo dong ben duoi va dong dong ben tren
    //res.redirect(vnpUrl)
  } catch (err) {
    console.log(err);
  }
};

// kiểm tra url trả về
let checkReturnUrl = (req, res) => {
  try {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = "ODJLXOCEWMFIEJXHJNMZUVFFVRDDXLOT";

    let signData =
      secretKey + querystring.stringify(vnp_Params, { encode: false });

    let checkSum = sha256(signData);

    if (secureHash === checkSum) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

      res.json({ code: vnp_Params["vnp_ResponseCode"] });
    } else {
      res.json({ code: "97" });
    }
  } catch (err) {
    console.log(err);
  }
};

// sort object
function sortObject(o) {
  var sorted = {},
    key,
    a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}

module.exports = {
  test,
  postCreatePaymentUrl,
  checkReturnUrl,
};
