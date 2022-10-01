import React from 'react';

const About = () => {
  const linkedin = "https://www.linkedin.com/in/gupta-kumar-shashank";
  const github = "https://github.com/shashank-2310";

  return (
    <div className="container">
      <h1>About iNotebook</h1>
      <p style={{ fontSize: "18px" }}>
        iNotebook helps you to record your day-to-day activites such as notes, journal, shopping list, etc. It is a basic ReactJs project made by Shashank Gupta. You can connect with me using my handles given below: <br />
      </p>
      <button className="btn btn-outline-primary btn-lg mx-2" onClick={() => window.open(linkedin)} target="_blank">
        <i className="fa-brands fa-linkedin"></i> LinkedIn
      </button>
      <button className="btn btn-outline-dark btn-lg mx-2" onClick={() => window.open(github)} target="_blank">
        <i className="fa-brands fa-linkedin"></i> Github
      </button>
    </div>
  )
}

export default About