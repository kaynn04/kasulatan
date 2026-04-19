# Feature: Create Agreement

## Goal
Allow a logged-in user to create a new agreement with another party.

## Who uses this feature
- The agreement creator

## Frontend Responsibility
The frontend should:
- show a form
- collect the input values
- validate basic required fields
- send the data to the backend
- show success or error messages
- redirect to the agreement details page after success

## Backend Responsibility
The backend should:
- receive the request
- check that the user is logged in
- validate the input properly
- create the Agreement record
- create the related AgreementParty records
- create an AuditLog entry
- return the created agreement data

## Database Responsibility
The database should store:
- the Agreement
- the creator party
- the counterparty party
- the audit log for creation

## Inputs From Frontend
These are the values the frontend sends:

- agreementType
- title
- subjectMatter
- amount
- currency
- paymentTerms
- dueDate
- termsText
- creatorFullName
- creatorEmail
- creatorMobileNumber
- counterpartyFullName
- counterpartyEmail
- counterpartyMobileNumber

## Example Request Body
```json
{
  "agreementType": "loan",
  "title": "Personal Loan Agreement",
  "subjectMatter": "Loan of PHP 5,000",
  "amount": 5000,
  "currency": "PHP",
  "paymentTerms": "Repay in full on May 30, 2026",
  "dueDate": "2026-05-30",
  "termsText": "The borrower agrees to repay PHP 5,000 on or before May 30, 2026.",
  "creatorFullName": "Juan Dela Cruz",
  "creatorEmail": "juan@example.com",
  "creatorMobileNumber": "09171234567",
  "counterpartyFullName": "Pedro Santos",
  "counterpartyEmail": "pedro@example.com",
  "counterpartyMobileNumber": "09179876543"
}
```
