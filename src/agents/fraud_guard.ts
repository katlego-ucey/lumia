
export interface FraudReport {
  isSuspicious: boolean;
  riskScore: number; // 0 to 100
  flags: string[];
  recommendation: string;
}

export class FraudGuardAgent {
  async scrutinizeJob(jobTitle: string, company: string, description: string, contactEmail?: string): Promise<FraudReport> {
    const flags: string[] = [];
    let riskScore = 0;

    // Gate 1: WhatsApp Sentinel & Upfront Fees
    const scamTriggers = [
      "pay upfront", "registration fee", "medical fee", "training deposit",
      "payment before", "whatsapp the recruiter", "urgent deposit"
    ];
    
    const lowerDesc = description.toLowerCase();
    scamTriggers.forEach(trigger => {
      if (lowerDesc.includes(trigger)) {
        riskScore += 40;
        flags.push(`Scam Trigger Found: "${trigger}"`);
      }
    });

    // Gate 2: Domain Check (Simplified for prototype)
    if (contactEmail) {
      const publicDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];
      const domain = contactEmail.split('@')[1];
      if (publicDomains.includes(domain)) {
        riskScore += 20;
        flags.push("Public Email Domain: Professional companies rarely use Gmail/Outlook for hiring.");
      }
    }

    // Gate 3: CIPC/Company Legitimacy (Mock)
    if (company.toLowerCase().includes("ltd") || company.toLowerCase().includes("pty")) {
        // Assume more legitimate if they use corporate suffixes
        riskScore -= 5;
    } else {
        riskScore += 10;
        flags.push("Informal Company Name: No registration suffix (Pty Ltd/Inc) found.");
    }

    const isSuspicious = riskScore >= 30;
    
    return {
      isSuspicious,
      riskScore: Math.min(riskScore, 100),
      flags,
      recommendation: isSuspicious 
        ? "⚠️ HIGH RISK: This listing has multiple red flags. Do NOT pay any money or share sensitive documents." 
        : "✅ Low Risk: Company name and description appear standard."
    };
  }
}
