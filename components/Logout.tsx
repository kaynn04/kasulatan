import logoutUser from "@/app/logout/action";

export default function Logout() {
    return (
        <form>
            <button type="submit" formAction={logoutUser}>Logout</button>
        </form>
    );
};
