const express = require("express");
const router = express.Router();
const transporter = require("../utils/mailer");

router.post("/", async (req, res) => {
    try {
        const { name, email, phone, company, message } = req.body;

        await transporter.sendMail({
            // Sender shown in the inbox
            from: `"Uniweldz Solutions" <${process.env.EMAIL_USER}>`,

            // Your company email receives the inquiry
            to: process.env.RECEIVER_EMAIL,

            // Clicking Reply replies to the customer
            replyTo: email,

            subject: `New Inquiry from ${name}`,

            html: `
                <h2>📩 New Inquiry</h2>

                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${name}</td>
                    </tr>

                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>${email}</td>
                    </tr>

                    <tr>
                        <td><strong>Phone:</strong></td>
                        <td>${phone || "N/A"}</td>
                    </tr>

                    <tr>
                        <td><strong>Company:</strong></td>
                        <td>${company || "N/A"}</td>
                    </tr>
                </table>

                <br>

                <h3>Message</h3>

                <p>${message}</p>
            `,
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (err) {
        console.error("Mail Error:", err);

        res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }
});

module.exports = router;