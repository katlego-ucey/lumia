
import { UserProfile } from './onboarding';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export class CVMorphingAgent {
  async generateCV(profile: UserProfile, jobDescription?: string): Promise<string> {
    // In a real implementation, this would use LLM to tailor the CV
    // For now, we'll create a standard ATS-friendly HTML template
    
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            h2 { color: #555; margin-top: 20px; border-bottom: 1px solid #ccc; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${profile.fullName}</h1>
          <div class="section">
            <p><span class="label">Location:</span> ${profile.location}</p>
            <p><span class="label">Languages:</span> ${profile.languages?.join(', ')}</p>
          </div>
          
          <h2>Professional Summary</h2>
          <p>Results-oriented professional with ${profile.experienceYears} years of experience. Focused on delivering high-impact communication and project support.</p>
          
          <h2>Education</h2>
          <p>${profile.educationLevel}</p>
          
          <h2>Skills</h2>
          <ul>
            ${profile.skills.map(s => `<li>${s}</li>`).join('') || '<li>General Communication</li><li>Problem Solving</li><li>Team Collaboration</li>'}
          </ul>
        </body>
      </html>
    `;

    const fileName = `cv_${profile.id}.pdf`;
    const outputPath = path.join(__dirname, '../../public', fileName);
    
    // Ensure public directory exists
    if (!fs.existsSync(path.join(__dirname, '../../public'))) {
        fs.mkdirSync(path.join(__dirname, '../../public'));
    }

    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../api/generate_pdf.py');
      // Escape HTML for shell
      const escapedHtml = htmlContent.replace(/"/g, '\\"');
      
      exec(`python3 ${pythonScript} "${escapedHtml}" ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating PDF: ${error}`);
          reject(error);
        } else {
          resolve(fileName);
        }
      });
    });
  }
}
