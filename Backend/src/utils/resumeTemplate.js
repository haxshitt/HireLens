function buildResumeHtml(formData, scaleFactor = 1.0) {
  const {
    personalInfo,
    links,
    summary,
    skills,
    education,
    projects,
    certificates,
    achievements,
    responsibilities,
  } = formData;

  const renderLinks = () => {
    if (!links || links.length === 0) return "";
    return links
      .map((link) => `<a href="${link.url}" target="_blank">${link.label}</a>`)
      .join(" | ");
  };

  const renderSummary = () => {
    if (!summary) return "";
    return `
            <div class="section">
                <h2>SUMMARY</h2>
                <p>${summary}</p>
            </div>
        `;
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return "";
    return `
            <div class="section">
                <h2>TECHNICAL SKILLS</h2>
                <ul class="skills-list">
                    ${skills
                      .map(
                        (group) => `
                        <li><strong>${group.category}:</strong> ${group.items.join(", ")}</li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
        `;
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return "";
    return `
            <div class="section">
                <h2>EDUCATION</h2>
                ${education
                  .map(
                    (edu) => `
                    <div class="item">
                        <div class="item-header">
                            <span class="item-title"><strong>${edu.institution}</strong></span>
                            <span class="item-date">${edu.duration}</span>
                        </div>
                        <div class="item-subheader">
                            <span>${edu.degree}</span>
                            <span>${edu.score ? `Score: ${edu.score}` : ""}</span>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return "";
    return `
            <div class="section">
                <h2>PROJECTS</h2>
                ${projects
                  .map(
                    (proj) => `
                    <div class="item">
                        <div class="item-header">
                            <span class="item-title"><strong>${proj.title}</strong> | <em>${proj.techStack}</em></span>
                        </div>
                        <ul class="bullets">
                            ${proj.bullets.map((b) => `<li>${b}</li>`).join("")}
                        </ul>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  };

  const renderCertificates = () => {
    if (!certificates || certificates.length === 0) return "";
    return `
            <div class="section">
                <h2>CERTIFICATES</h2>
                <ul class="bullets">
                    ${certificates
                      .map(
                        (cert) => `
                        <li><strong>${cert.title}:</strong> ${cert.description}</li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
        `;
  };

  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) return "";
    return `
            <div class="section">
                <h2>ACHIEVEMENTS</h2>
                <ul class="bullets">
                    ${achievements.map((ach) => `<li>${ach}</li>`).join("")}
                </ul>
            </div>
        `;
  };

  const renderResponsibilities = () => {
    if (!responsibilities || responsibilities.length === 0) return "";
    return `
            <div class="section">
                <h2>POSITIONS OF RESPONSIBILITY</h2>
                <ul class="bullets">
                    ${responsibilities
                      .map(
                        (resp) => `
                        <li><strong>${resp.title}:</strong> ${resp.description}</li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
        `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        :root {
            --scale-factor: ${scaleFactor};
            --heading-color: #1F4E79;
            --body-color: #1a1a1a;
            --divider-color: #D0D0D0;
            --base-margin: calc(1.25rem * var(--scale-factor));
            --small-margin: calc(0.25rem * var(--scale-factor));
            --medium-margin: calc(0.5rem * var(--scale-factor));
            --large-margin: calc(1.5rem * var(--scale-factor));
        }
        body {
            font-family: Calibri, Carlito, Arial, sans-serif;
            font-size: calc(10pt * var(--scale-factor));
            font-weight: normal;
            line-height: 1.4;
            color: var(--body-color);
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: var(--large-margin);
        }
        .header h1 {
            font-size: calc(22pt * var(--scale-factor));
            margin: 0 0 var(--small-margin) 0;
            text-transform: uppercase;
            font-weight: bold;
        }
        .header .contact-info {
            font-size: calc(10pt * var(--scale-factor));
            margin-bottom: var(--small-margin);
        }
        .header a {
            color: var(--body-color);
            text-decoration: none;
        }
        .section {
            margin-bottom: var(--base-margin);
        }
        .section h2 {
            font-size: calc(12pt * var(--scale-factor));
            text-transform: uppercase;
            font-weight: bold;
            color: var(--heading-color);
            border-bottom: 1px solid var(--divider-color);
            margin: 0 0 var(--medium-margin) 0;
            padding-bottom: 0.15rem;
        }
        .section p {
            margin: 0 0 var(--medium-margin) 0;
            text-align: justify;
        }
        .item {
            margin-bottom: calc(0.75rem * var(--scale-factor));
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.15rem;
        }
        .item-title {
            font-size: calc(10.5pt * var(--scale-factor));
        }
        .item-date {
            font-size: calc(10pt * var(--scale-factor));
            font-style: italic;
        }
        .item-subheader {
            display: flex;
            justify-content: space-between;
            font-size: calc(10pt * var(--scale-factor));
            margin-bottom: var(--small-margin);
        }
        ul.skills-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        ul.skills-list li {
            margin-bottom: var(--small-margin);
        }
        ul.bullets {
            margin: 0;
            padding-left: calc(1.25rem * var(--scale-factor));
        }
        ul.bullets li {
            margin-bottom: var(--small-margin);
            text-align: justify;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${personalInfo.fullName}</h1>
            <div class="contact-info">
                ${personalInfo.phone} | ${personalInfo.email}
            </div>
            <div class="contact-info">
                ${renderLinks()}
            </div>
        </div>

        ${renderSummary()}
        ${renderSkills()}
        ${renderEducation()}
        ${renderProjects()}
        ${renderCertificates()}
        ${renderAchievements()}
        ${renderResponsibilities()}
    </div>
</body>
</html>
    `;
}

module.exports = { buildResumeHtml };
