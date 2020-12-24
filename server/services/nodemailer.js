// gửi email
// smtp service
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "shopminbeauty@gmail.com",
    pass: "Min123456@",
  },
});
// gửi mail xác nhận  
const sendMail = async (to, subject, data) => {
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "support@minbeauty.tk", // sender address
    to,//receiver
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
// gửi mail đơn hàng về cho khách 
const sendMailOrder = async (to, order, products) => {
  try {
    let tableProducts = order.products.map((e) => {
      let tmp = products.find((product) => {
        return product._id.toString() === e.productId._id.toString();
      });

      return `<tr>
        <td style="border: 1px solid black;">${e.productId.name}</td>
        <td style="border: 1px solid black;">${e.amount}</td>
        <td style="border: 1px solid black;">${formatPrice(
          tmp.priceDiscount ? tmp.priceDiscount : tmp.price
        )}₫</td>
      </tr>`;
    });
    // tạm tính tiền 
    function getTotalTmp() {
      return order.products.reduce((acc, e) => {
        let tmp = products.find((product) => {
          return product._id.toString() === e.productId._id.toString();
        });
        return (
          acc + (tmp.priceDiscount ? tmp.priceDiscount : tmp.price) * e.amount
        );
      }, 0);
    }

    let info = await transporter.sendMail({
      from: "MIN Store", // sender address
      to: `${to}, shopminbeauty@gmail.com`,
      subject: "Đơn hàng từ MIN Store",
      html: `<div style="font-size: 20px">
          <div style= "font-size: 24px; font-weight: 1000">
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
          <div style="font-size: 24px; font-weight: 1000">
            Thông tin đơn hàng
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid black;">Hàng hóa</th>
              <th style="border: 1px solid black;">SL</th>
              <th style="border: 1px solid black;">GIá</th>
            </tr>
            ${tableProducts.join("")}
          </table>
          <table>
            <tr>
              <td style="font-size: 20px; font-weight:600">Tạm tính</td>
              <td style="font-size: 20px; font-weight:600">${formatPrice(
                getTotalTmp()
              )}₫</td>
            </tr>
            <tr>
              <td style="font-size: 20px; font-weight:600">Phí ship</td>
              <td style="font-size: 20px; font-weight:600">${
                order.shipType === "fast" ? formatPrice(40000) : 0
              }₫</td>
            </tr>
            <tr>
              <td style="font-size: 20px; font-weight:600">Tổng tiền</td>
              <td style="font-size: 20px; font-weight:600">${formatPrice(
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
