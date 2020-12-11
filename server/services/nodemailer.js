const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // host: "smtp.ethereal.email",
  // port: 587,
  // secure: false, // true for 465, false for other ports
  // auth: {
  //   user: "ol7sswpyi4q4ewdw@ethereal.email", // generated ethereal user
  //   pass: "b2WjccXrsyyQV61Er4", // generated ethereal password
  // },
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "bondnguyenclone@gmail.com",
    pass: "Nguyenhoangtuan20@",
  },
});

const sendMail = async (to, subject, data) => {
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "MIN Store", // sender address
    to,
    subject,
    html: data,
  });

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

function formatPrice(x) {
  x += "";
  return x.length
    ? x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    : "";
}

const sendMailOrder = async (to, order) => {
  console.log(order);
  try {
    let tableProducts = order.products.map(
      (e) =>
        `<tr style={ font-size: "16px", font-style: "italic" }>
        <td style={border: "1px solid black"}>${e.productId.name}</td>
        <td style={ width: "10%", border: "1px solid black" }${e.amount}</td>
        <td style={ width: "10%", border: "1px solid black" }>
          ${formatPrice(e.productId.price)}₫
        </td>
      </tr>`
    );

    function getTotalTmp() {
      return order.products.reduce(
        (acc, e) => acc + e.productId.price * e.amount,
        0
      );
    }

    let info = await transporter.sendMail({
      from: "MIN Store", // sender address
      to,
      subject: "Đơn hàng từ MIN Store",
      html: `<div style={ font-size: "20px" }>
          <div style={ font-size: "24px", font-weight: "1000" }>
            Thông tin người nhận
          </div>
          <div>
            Họ tên: <strong>${order.name}</strong>
          </div>
          <div>
            Địa chỉ: <strong>${order.address}</strong>
          </div>
          <div>
            Số điện thoại: <strong>${order.phone}</strong>
          </div>
          <div>
            Ghi chú: <strong>${order.note}</strong>
          </div>
          <div style={ font-size: "24px", font-weight: "1000" }>
            Thông tin đơn hàng
          </div>
          <table style={ width: "100%", margin: "auto" }>
            <tr>
              <th>Hàng hóa</th>
              <th>SL</th>
              <th>GIá</th>
            </tr>
            ${tableProducts}
          </table>
          <table
            style={
              font-weight: "1000",
              width: "100%",
              border-collapse: "collapse",
              border: "1px solid black"
            }
          >
            <tr>
              <td style={border: "1px solid black"}>Tạm tính</td>
              <td style={border: "1px solid black"}>${formatPrice(
                getTotalTmp()
              )}₫</td>
            </tr>
            <tr>
              <td style={border: "1px solid black"}>Phí ship</td>
              <td style={border: "1px solid black"}>${
                order.shipType === "fast" ? formatPrice(40000) : 0
              }₫</td>
            </tr>
            <tr>
              <td style={border: "1px solid black"}>Tổng tiền</td>
              <td style={border: "1px solid black"}>${formatPrice(
                order.total
              )}₫</td>
            </tr>
          </table>
        </>
    </div>
    `,
    });

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendMail,
  sendMailOrder,
};
