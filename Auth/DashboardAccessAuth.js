import jwt from "jsonwebtoken";

const DashboardAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        console.log(authHeader)

        const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
        const secretKey = process.env.JWT_SECRET;

        // Verify the token
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden: Invalid token" });
            }

            req.user = decoded; 
            next(); // Proceed to the next middleware/controller
        });

    } catch (err) {
        console.error("Failed to validate token | Access denied!", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default DashboardAuth;
