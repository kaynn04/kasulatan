"use client";

import { useActionState } from "react";
import { signAgreementAsCreator } from "./actions";

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

export default function SignCreatorForm({
    agreementId,
    creatorName,
}: {
    agreementId: string;
    creatorName: string;
}) {
    const [state, action, pending] = useActionState(signAgreementAsCreator, initialState);

    return (
        <form action={action}>
            <input type="hidden" name="agreementId" value={agreementId} />

            {/* General errors (not tied to a field */}
            {state?.errors?.general && <p style={{ color: "red" }}>{state.errors.general}</p>}

            <div>
                <label>
                    <input type="checkbox" name="confirmedRead" />
                    I have read and understood the agreement.
                </label>
                {state?.errors?.confirmedRead && <p style={{ color: "red" }}>{state.errors.confirmedRead}</p>}
            </div>

            <div>
                <label>
                    <input type="checkbox" name="consentedSignature" />
                    I consent to the use of my electronic signature.
                </label>
                {state?.errors?.consentedSignature && <p style={{ color: "red" }}>{state.errors.consentedSignature}</p>}
            </div>

            <div>
                <label htmlFor="typedSignature">
                    Type your full name as your signature ({creatorName})
                </label>
                <input type="text" name="typedSignature" id="typedSignature" />
                {state?.errors?.typedSignature && <p style={{ color: "red" }}>{state.errors.typedSignature}</p>}
            </div>
                
            <button type="submit" disabled={pending}>
                {pending ? "Signing..." : "Sign Agreement"}
            </button>
        </form>
    );
}
