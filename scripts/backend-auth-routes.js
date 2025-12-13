/**
 * Backend Authentication Routes for Fastify
 * File location in backend: src/routes/auth.js
 *
 * Install required packages first:
 * npm install bcrypt jsonwebtoken
 */

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Environment variables needed in your backend .env:
// JWT_SECRET=your-secret-key-here
// JWT_EXPIRES_IN=7d

async function authRoutes(fastify, options) {
  /**
   * POST /auth/signup
   * Create new user account
   */
  fastify.post("/auth/signup", async (request, reply) => {
    try {
      const { email, password, company_name, website_url } = request.body

      // Validate required fields
      if (!email || !password || !company_name || !website_url) {
        return reply.code(400).send({
          success: false,
          message: "All fields are required",
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return reply.code(400).send({
          success: false,
          message: "Invalid email format",
        })
      }

      // Validate password strength (minimum 8 characters)
      if (password.length < 8) {
        return reply.code(400).send({
          success: false,
          message: "Password must be at least 8 characters",
        })
      }

      // TODO: Check if user already exists in your database
      // Example: const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      // if (existingUser.length > 0) { return reply.code(409).send({ message: 'User already exists' }); }

      // Hash password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // TODO: Save user to database
      // Example: const result = await db.query('INSERT INTO users (email, password, company_name, website_url) VALUES (?, ?, ?, ?)',
      //   [email, hashedPassword, company_name, website_url]);
      // const userId = result.insertId;

      // Mock user ID for now
      const userId = Date.now()

      // Generate JWT token
      const token = jwt.sign(
        {
          userId,
          email,
          companyName: company_name,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      )

      return reply.code(201).send({
        success: true,
        message: "Account created successfully",
        session_token: token,
        user: {
          id: userId,
          email,
          companyName: company_name,
          websiteUrl: website_url,
        },
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        success: false,
        message: "Server error during signup",
      })
    }
  })

  /**
   * POST /auth/login
   * User login
   */
  fastify.post("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          message: "Email and password are required",
        })
      }

      // TODO: Get user from database
      // Example: const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      // if (users.length === 0) { return reply.code(401).send({ message: 'Invalid credentials' }); }
      // const user = users[0];

      // Mock user for now - replace with actual database query
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: await bcrypt.hash("password123", 10), // Mock hashed password
        company_name: "Test Company",
        website_url: "https://example.com",
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, mockUser.password)
      if (!isValidPassword) {
        return reply.code(401).send({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: mockUser.id,
          email: mockUser.email,
          companyName: mockUser.company_name,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      )

      return reply.send({
        success: true,
        message: "Login successful",
        session_token: token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          companyName: mockUser.company_name,
          websiteUrl: mockUser.website_url,
        },
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        success: false,
        message: "Server error during login",
      })
    }
  })

  /**
   * POST /auth/logout
   * User logout (client-side handles token removal)
   */
  fastify.post("/auth/logout", async (request, reply) => {
    // With JWT, logout is handled client-side by removing the token
    return reply.send({
      success: true,
      message: "Logged out successfully",
    })
  })

  /**
   * GET /auth/verify
   * Verify JWT token
   */
  fastify.get(
    "/auth/verify",
    {
      preHandler: async (request, reply) => {
        try {
          const authHeader = request.headers.authorization
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.code(401).send({ success: false, message: "No token provided" })
          }

          const token = authHeader.split(" ")[1]
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
          request.user = decoded
        } catch (error) {
          return reply.code(401).send({ success: false, message: "Invalid or expired token" })
        }
      },
    },
    async (request, reply) => {
      return reply.send({
        success: true,
        user: request.user,
      })
    },
  )
}

module.exports = authRoutes

/**
 * To use in your backend src/index.js:
 *
 * fastify.register(require('./routes/auth'), { prefix: '/auth' });
 */
