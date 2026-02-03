/**
 * Credentials API Swagger Documentation
 *
 * @module src/routes/credentials.swagger
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CredentialStatus:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         provider:
 *           type: string
 *           enum: [epic, gog, steam]
 *         hasCredentials:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [active, inactive, verification_failed, expired]
 *           nullable: true
 *         errorMessage:
 *           type: string
 *           nullable: true
 *         lastVerifiedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Cookie:
 *       type: object
 *       required:
 *         - name
 *         - value
 *       properties:
 *         name:
 *           type: string
 *         value:
 *           type: string
 *         domain:
 *           type: string
 *         path:
 *           type: string
 *         expires:
 *           type: number
 *         httpOnly:
 *           type: boolean
 *         secure:
 *           type: boolean
 *         sameSite:
 *           type: string
 *           enum: [Strict, Lax, None]
 *
 *     EpicCredentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         otpSecret:
 *           type: string
 *           description: TOTP secret for 2FA (optional)
 *         cookies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cookie'
 *         sessionToken:
 *           type: string
 *         parentalPin:
 *           type: string
 *           pattern: '^\d{4}$'
 *           description: 4-digit parental control PIN
 *       oneOf:
 *         - required: [email]
 *         - required: [cookies]
 *         - required: [sessionToken]
 *
 *     GOGCredentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         otpSecret:
 *           type: string
 *           description: TOTP secret for 2FA (optional)
 *         cookies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cookie'
 *         sessionToken:
 *           type: string
 *         unsubscribeMarketing:
 *           type: boolean
 *           default: false
 *       oneOf:
 *         - required: [email]
 *         - required: [cookies]
 *         - required: [sessionToken]
 *
 *     SteamCredentials:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *         otpSecret:
 *           type: string
 *           description: TOTP secret for 2FA (optional)
 *         cookies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cookie'
 *         sessionToken:
 *           type: string
 *         steamGuardCode:
 *           type: string
 *       oneOf:
 *         - required: [username]
 *         - required: [cookies]
 *         - required: [sessionToken]
 */

/**
 * @swagger
 * tags:
 *   - name: Credentials
 *     description: Provider credential management
 */
