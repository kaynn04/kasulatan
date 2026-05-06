type PageIntroProps = {
  title: string;
  description: string;
};

export default function PageIntro({ title, description }: PageIntroProps) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "56px",
        lineHeight: 1.15,
        color: "white",
        margin: "0 0 20px",
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: "18px",
        lineHeight: 1.75,
        color: "rgba(255,255,255,0.75)",
        margin: 0,
        maxWidth: "480px",
      }}>
        {description}
      </p>
    </section>
  );
}