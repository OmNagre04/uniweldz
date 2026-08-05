const transporter = require("../utils/mailer");

module.exports = async (req, res) => {

    // Allow requests from your frontend
    res.setHeader("Access-Control-Allow-Origin", "https://www.uniweldz-solutions.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Allow only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed",
        });
    }

    try {

        const {
            name,
            email,
            phone,
            company,
            message,
        } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        await transporter.sendMail({
            from: `"Uniweldz Solutions" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            replyTo: email,
            subject: `New Inquiry from ${name}`,
            html: `
                <h2>📩 New Inquiry</h2>

                <table border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <td><b>Name</b></td>
                        <td>${name}</td>
                    </tr>

                    <tr>
                        <td><b>Email</b></td>
                        <td>${email}</td>
                    </tr>

                    <tr>
                        <td><b>Phone</b></td>
                        <td>${phone || "N/A"}</td>
                    </tr>

                    <tr>
                        <td><b>Company</b></td>
                        <td>${company || "N/A"}</td>
                    </tr>
                </table>

                <br>

                <h3>Message</h3>

                <p>${message}</p>
            `,
        });

        return res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (err) {

        console.error("Mail Error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to send email",
        });

    }

};