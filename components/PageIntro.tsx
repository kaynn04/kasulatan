type PageIntroProps = {
    title: string;
    description: string;
};

export default function PageIntro({
    title,
    description,
}: PageIntroProps) {
    return (
        <section>
            <h1>{title}</h1>
            <p>{description}</p>
        </section>
    );
}