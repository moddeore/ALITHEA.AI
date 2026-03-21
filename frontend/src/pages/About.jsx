import modImage from '../assets/mod.png';
import anandImage from '../assets/anand.png';
import rushiimage from '../assets/rushi.png';
import tejasimage from '../assets/tejas.png';

function About() {
  return (
    <div className="about-container fade-in">
      <header className="hero">
        <h1>About ALITHEA.AI</h1>
        <p>Empowering users with state-of-the-art AI detection technology to combat misinformation.</p>
      </header>

      <div className="about-content">
        <section className="card slide-up" style={{ animationDelay: '0.1s' }}>
          <h2>Our Mission</h2>
          <p>
            As generative AI becomes increasingly sophisticated, the line between reality and
            fabrication is blurring. Our mission is to provide an accessible, fast, and highly
            accurate tool to help individuals and organizations verify the authenticity of the
            images they encounter online.
          </p>
        </section>

        <section className="card slide-up" style={{ animationDelay: '0.2s' }}>
          <h2>How It Works</h2>
          <p>
            ALITHEA.AI utilizes a fine-tuned MobileNetV2 neural network. By analyzing
            pixel-level artifacts, noise patterns, and semantic inconsistencies that are
            often invisible to the human eye, our model can predict whether an image was
            captured by a real camera or synthesized by an AI image generator.
          </p>
          <div className="tech-stack" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="badge">TensorFlow</span>
            <span className="badge">FastAPI</span>
            <span className="badge">React</span>
            <span className="badge">Vite</span>
          </div>
        </section>

        <section className="card slide-up" style={{ animationDelay: '0.3s' }}>
          <h2>Limitations</h2>
          <p>
            While our model achieves high accuracy, no AI detection tool is perfect.
            Compressions, heavy edits, and low-resolution images can sometimes confuse the
            algorithm. We recommend using ALITHEA.AI as one of several signals when
            evaluating the authenticity of an image, alongside source verification and reverse
            image searching.
          </p>
        </section>

        <section className="card slide-up" style={{ animationDelay: '0.4s', marginTop: '2rem' }}>
          <h2>Meet the Team</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We are a group of dedicated developers and AI enthusiasts committed to building tools for a more transparent digital world.
          </p>
          <div className="team-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            {[
              {
                name: 'Mod Deore',
                role: 'Machine Learning Engineer',
                description: 'Specializes in computer vision and deep learning model optimization.',
                image: modImage,
                linkedin: 'https://www.linkedin.com/in/mod-deore-836504345?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
              },
              {
                name: 'Anand Patekhede',
                role: 'Frontend Developer',
                description: 'Creates intuitive and responsive user interfaces using React and Vite.',
                image: anandImage,
                linkedin: 'https://www.linkedin.com/in/anand-patekhede-02b182337/'
              },
              {
                name: 'Rushikesh Shinde',
                role: 'Backend Developer',
                description: 'Architects robust APIs and manages server infrastructure.',
                image: rushiimage,
                linkedin: 'https://www.linkedin.com/in/rushikeshshinde4241?utm_source=share_via&utm_content=profile&utm_medium=member_android'
              },
              {
                name: 'Tejas Mahamuni',
                role: 'Data Scientist',
                description: 'Curates and processes datasets for training highly accurate models.',
                image: tejasimage,
                linkedin: 'https://www.linkedin.com/in/tejasmahamuni/'
              }
            ].map((member, index) => (
              <div key={index} className="team-card" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    marginBottom: '1rem',
                    border: '3px solid var(--primary)'
                  }}
                />
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{member.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', margin: '0 0 0.8rem 0', fontSize: '0.9rem' }}>{member.role}</p>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', flexGrow: 1 }}>{member.description}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.4rem 1rem',
                    background: '#0077b5',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    width: '100%',
                    textAlign: 'center'
                  }}
                >
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
