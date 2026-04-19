# Data Model

## 1. User
Represents a person with an account in the system.

Fields:
- id
- name
- email
- passwordHash
- createdAt
- updatedAt

Why it exists:
- Needed for authentication
- Needed to know who created agreements
- Needed to track actions in audit logs


## 2. Agreement
Represents the main transaction record between two parties.

Fields:
- id
- referenceNumber
- createdById
- agreementType
- title
- subjectMatter
- amount
- currency
- paymentTerms
- dueDate
- termsText
- status
- serviceFee
- createdAt
- updatedAt

Why it exists:
- This is the main record users care about
- The frontend will create, list, and display agreements
- The backend will validate and save this data

## 3. AgreementParty
Represents each person involved in one agreement

Fields:
- id
- agreementId
- userId
- role
- fullName
- email
- mobileNumber
- address
- typedSignature
- consentedToElectricSignature
- confirmedReadAgreement
- signedAt
- ipAddress
- userAgent
- createdAt
- updatedAt

Why it exists:
- One agreement has multiple parties
- Stores who signed and how they signed
- Important for evidence and auditability

## 4. Payment
Represents the payment for your platform service fee.

Fields:
- id
- agreementId
- userId
- provider
- checkoutSessionId
- amount
- currency
- status
- paidAt
- createdAt
- updatedAt

Why it exists:
- Lets the backend track whether the service fee was paid
- Lets the frontend show payment status and receipt info

## 5. AuditLog
Represents important actions taken in the system.

Fields:
- id
- agreementId
- actorUserId
- actorEmail
- action
- ipAddress
- userAgent
- metadataJson
- createdAt

Why it exists:
- Helps preserve an evidence trail
- Lets us track creation, signing, payment, and downloads

## 6. AgreementAttachment
Represents files attached to an agreement.

Fields:
- id
- agreementId
- uploadedByUserId
- fileName
- fileUrl
- mimeType
- createdAt
- updatedAt

Why it exists:
- Users may attach proof like receipts or item photos
- The agreement can have supporting evidence

# Relationships

- One User can create many Agreements
- One Agreement belongs to one creator User
- One Agreement has many AgreementParty records
- One Agreement can have many AuditLog records
- One Agreement can have many AgreementAttachment records
- One Agreement can have one or more Payment records
- One User can have many Payments
- One User can appear in many AuditLog records

# Important Full-Stack Reminder

The frontend does not invent data on its own.
The frontend only:
- collects input
- displays data
- sends requests
- shows success or errors

The backend:
- receives data
- validates it
- applies business rules
- saves it to the database
- returns a response

The database:
- stores the system state permanently

# Example Flow: Create Agreement

1. User opens the create agreement page.
2. Frontend shows a form.
3. User fills in title, type, amount, and terms.
4. Frontend sends the form data to the backend.
5. Backend validates the request.
6. Backend creates an Agreement record.
7. Backend creates AgreementParty records.
8. Backend creates an AuditLog record like "agreement_created".
9. Backend returns the created agreement.
10. Frontend redirects to the agreement details page.