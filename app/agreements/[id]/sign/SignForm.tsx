"use client";

import { useActionState } from "react";
import { signAgreement } from "./actions";

type SignAgreementState = {
    success: boolean;
    errors: {
        confirmedRead?: string;
        consentedSignature?: string;
        typedSignature?: string;
        general?: string;
    };
};

const initialState: SignAgreementState = {
    success: false,
    errors: {},
};

// This component receives the agreement ID and counterparty name as props.
// The page (server component) passes these after reading from the DB.
export default function SignForm({
    agreementId,
    counterPartyName,
}: {
    agreementId: string;
    counterPartyName: string;
}) {
    const [state, action, pending] = useActionState(signAgreement, initialState);

    return (
        <form action={action}>
            {/* Hidden input - sends the agreement ID to the server action.
                The user doesn't see this, but the server needs it. */}
            <input type="hidden" name="agreementId" value={agreementId} />
            
            {/* General errors (not tied to a field */}
            {state?.errors?.general && <p style={{ color: "red" }}>{state.errors.general}</p>}

            <div>
                <label>
                    <input type="checkbox" name="confirmedRead" />
                    I have read and understood this agreement.
                </label>
                {state?.errors?.confirmedRead && <p style={{ color: "red"}}>{state.errors.confirmedRead}</p>}
            </div>

            <div>
                <label>
                    <input type="checkbox" name="consentedSignature" />
                    I consent to signing this agreement electronically
                </label>
                {state?.errors?.consentedSignature && <p style={{ color: "red" }}>{state.errors.consentedSignature}</p>}
            </div>


            <div>
                <label htmlFor="typedSignature">
                    Type your full name as your signature ({counterPartyName})
                </label>
                <input id="typedSignature" name="typedSignature" type="text" />
                {state?.errors?.typedSignature && <p style={{ color: "red" }}>{state.errors.typedSignature}</p> }
            </div>

            <button type="submit" disabled={pending}>
                {pending ? "Signing..." : "Sign Agreement"}
            </button>
        </form>
    );
}
