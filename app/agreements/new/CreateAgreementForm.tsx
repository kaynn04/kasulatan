"use client";
// ^ This file runs in the BROWSER. It uses a React hook (useActionState),
// and hooks only work in client components.

import { useActionState } from "react";
import { createAgreement } from "./actions";
// ^ We import the server action and the initial state from the BE file.
// Even though actions.ts is "use server", Next.js handles the connection.
// The FE doesn't call the function directly — React sends the form data
// to the server behind the scenes.

type CreateAgreementState = {
    success: boolean;
    errors: {
        title?: string;
        agreementType?: string;
        subjectMatter?: string;
        amount?: string;
        paymentTerms?: string;
        termsText?: string;
        counterPartyName?: string;
        counterPartyEmail?: string;
    };
};

const initialState: CreateAgreementState = {
    success: false,
    errors: {},
};

export default function CreateAgreementForm() {
    const [state, action, pending] = useActionState(createAgreement, initialState);
    const errors = state?.errors ?? {}; // state might be null before the first submission, so we default to an empty object

    return (
        <form action={action}>
            {/* Each field follows the same pattern:
                1. Label + Input (same as before)
                2. Error display: check if state.errors has a message for this field
                   If yes, show it in red. If no, show nothing. */}

            <div>
                <label htmlFor="title">Agreement Title</label>
                <input id="title" name="title" type="text"/>
                {state.errors?.title && <p style={{ color: "red" }}>{state.errors.title}</p>}
            </div>
            
            <div>
                <label htmlFor="agreementType">Agreement Type</label>
                <select id="agreementType" name="agreementType">
                    <option value="LOAN">Loan</option>
                    <option value="SALE">Sale</option>
                    <option value="SERVICE">Service</option>
                </select>
                {state.errors?.agreementType && <p style={{ color: "red" }}>{state.errors.agreementType}</p>}
            </div>

            <div>
                <label htmlFor="subjectMatter">Subject Matter</label>
                <input id="subjectMatter" name="subjectMatter" type="text" />
                {state.errors?.subjectMatter && <p style={{ color: "red" }}>{state.errors.subjectMatter}</p>}
            </div>

            <div>
                <label htmlFor="amount">Amount</label>
                <input id="amount" name="amount" type="number" />
                {state.errors?.amount && <p style={{ color: "red" }}>{state.errors.amount}</p>}
            </div>

            <div>
                <label htmlFor="paymentTerms">Payment Terms</label>
                <input id="paymentTerms" name="paymentTerms" />
                {state.errors?.paymentTerms && <p style={{ color: "red" }}>{state.errors.paymentTerms}</p>}
            </div>

            <div>
                <label htmlFor="termsText">Terms</label>
                <textarea id="termsText" name="termsText" />
                {state.errors?.termsText && <p style={{ color: "red" }}>{state.errors.termsText}</p>}
            </div>

            <h2>Counterparty Details</h2>

            <div>
                <label htmlFor="counterPartyName">Full Name</label>
                <input id="counterPartyName" name="counterPartyName" type="text" />
                {state.errors?.counterPartyName && <p style={{ color: "red" }}>{state.errors.counterPartyName}</p>}
            </div>

            <div>
                <label htmlFor="counterPartyEmail">Email</label>
                <input id="counterPartyEmail" name="counterPartyEmail" type="email" />
                {state.errors?.counterPartyEmail && <p style={{ color: "red" }}>{state.errors.counterPartyEmail}</p>}
            </div>

            <div>
                <label htmlFor="counterPartyMobile">Mobile</label>
                <input id="counterPartyMobile" name="counterPartyMobile" type="tel" />
            </div>

            {/* disabled={pending} prevents double-submit.
                The text changes to "Creating..." while waiting for the server. */}
            <button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create Agreement"}
            </button>
        </form>
    );
}
