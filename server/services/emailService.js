const sgMail = require('@sendgrid/mail');

/**
 * Email Service for RiskLo
 * 
 * Sends risk summary emails to users after CSV analysis.
 * Uses SendGrid API (more reliable than SMTP in cloud environments like Railway).
 * 
 * Configuration via environment variables:
 * - EMAIL_FROM: Sender email address (required, must be verified in SendGrid)
 * - SMTP_PASS: SendGrid API key (starts with SG.)
 * 
 * Note: SMTP_HOST, SMTP_PORT, SMTP_USER are no longer needed when using SendGrid API.
 * The API key is passed as SMTP_PASS for backward compatibility.
 */

let isInitialized = false;

// Initialize SendGrid
function initializeTransporter() {
  // If already initialized, return true
  if (isInitialized) {
    return true;
  }

  const emailFrom = process.env.EMAIL_FROM;
  const sendgridApiKey = process.env.SMTP_PASS; // Using SMTP_PASS for SendGrid API key

  // Check if email is configured
  if (!emailFrom || !sendgridApiKey) {
    console.warn('Email service not configured. Missing environment variables:');
    console.warn('  EMAIL_FROM:', emailFrom ? '✓ Set' : '✗ Missing');
    console.warn('  SMTP_PASS (SendGrid API Key):', sendgridApiKey ? '✓ Set' : '✗ Missing');
    return false;
  }

  // Validate API key format
  if (!sendgridApiKey.startsWith('SG.')) {
    console.warn('Warning: SMTP_PASS should be a SendGrid API key starting with "SG."');
  }

  try {
    sgMail.setApiKey(sendgridApiKey);
    isInitialized = true;
    
    console.log('SendGrid email service initialized successfully');
    console.log('Email config:', {
      from: emailFrom,
      apiKeySet: true,
      apiKeyLength: sendgridApiKey.length,
      apiKeyPrefix: sendgridApiKey.substring(0, 3)
    });
    return true;
  } catch (error) {
    console.error('Error initializing SendGrid:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    return false;
  }
}

/**
 * Format risk level for display
 */
function formatRiskLevel(metrics) {
  if (!metrics) return 'UNKNOWN';
  
  // For Risk mode
  if (metrics.blowAccountStatus) {
    if (metrics.blowAccountStatus === 'NO GO') return 'NO GO';
    if (metrics.blowAccountStatus === 'CAUTION') return 'CAUTION';
    if (metrics.blowAccountStatus === 'GO') return 'GO';
  }
  
  // For 30% Drawdown mode
  if (metrics.apexMaeComparison) {
    return metrics.apexMaeComparison.exceedsMae ? 'NO GO' : 'GO';
  }
  
  // Fallback to risk score
  if (metrics.riskScore !== undefined) {
    if (metrics.riskScore >= 70) return 'HIGH';
    if (metrics.riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }
  
  return 'UNKNOWN';
}

/**
 * Get risk level color class for HTML
 */
function getRiskLevelClass(riskLevel) {
  if (riskLevel === 'NO GO' || riskLevel === 'HIGH') return 'risk-high';
  if (riskLevel === 'CAUTION' || riskLevel === 'MEDIUM') return 'risk-medium';
  if (riskLevel === 'GO' || riskLevel === 'LOW') return 'risk-low';
  return 'risk-unknown';
}

/**
 * Send risk summary email
 * 
 * @param {string} toEmail - Recipient email address
 * @param {Array} results - Array of account risk results
 * @param {string} riskMode - 'risk' or 'apexMae'
 * @returns {Promise<void>}
 */
async function sendRiskSummaryEmail(toEmail, results, riskMode = 'risk') {
  const isConfigured = initializeTransporter();
  
  if (!isConfigured) {
    throw new Error('Email service is not configured. Please set EMAIL_FROM and SMTP_PASS (SendGrid API key) environment variables.');
  }

  if (!results || results.length === 0) {
    throw new Error('No results to send');
  }

  const emailFrom = process.env.EMAIL_FROM;
  const appBaseUrl = process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'https://risklo.io';

  // Analyze results for summary
  let lowRiskCount = 0;
  let highRiskCount = 0;
  let noGoCount = 0;
  const highRiskAccounts = [];
  
  results.forEach((result) => {
    const metrics = result.metrics || {};
    const riskLevel = formatRiskLevel(metrics);
    
    if (riskLevel === 'LOW' || riskLevel === 'GO') {
      lowRiskCount++;
    } else if (riskLevel === 'HIGH' || riskLevel === 'CAUTION') {
      highRiskCount++;
      highRiskAccounts.push({
        name: result.accountName || `Account #${result.accountNumber || 'Unknown'}`,
        strategy: result.strategy || 'Unknown',
        riskLevel: riskLevel,
        riskScore: metrics.riskScore !== undefined ? metrics.riskScore : 'N/A'
      });
    } else if (riskLevel === 'NO GO') {
      noGoCount++;
      highRiskAccounts.push({
        name: result.accountName || `Account #${result.accountNumber || 'Unknown'}`,
        strategy: result.strategy || 'Unknown',
        riskLevel: riskLevel,
        riskScore: metrics.riskScore !== undefined ? metrics.riskScore : 'N/A'
      });
    }
  });

  // Build summary section HTML
  let summarySection = '';
  if (lowRiskCount > 0 && (highRiskCount === 0 && noGoCount === 0)) {
    // All accounts are low risk - positive message
    summarySection = `
      <div style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2.5rem;">✅</div>
          <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">All Accounts Show Low Risk</h2>
        </div>
        <p style="margin: 0; font-size: 1.1rem; opacity: 0.95;">
          Great news! All ${lowRiskCount} account${lowRiskCount > 1 ? 's' : ''} analyzed show <strong>low risk levels</strong> and are within safe drawdown limits. 
          Your current configurations appear to be well-aligned with your risk tolerance.
        </p>
      </div>
    `;
  } else if (noGoCount > 0 || highRiskCount > 0) {
    // High risk detected - warning message
    const totalHighRisk = noGoCount + highRiskCount;
    summarySection = `
      <div style="
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2.5rem;">⚠️</div>
          <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #ffffff;">High Risk Alert: ${totalHighRisk} Account${totalHighRisk > 1 ? 's' : ''} Require Attention</h2>
        </div>
        <p style="margin: 0; font-size: 1.1rem; margin-bottom: 1rem; color: #ffffff;">
          ${noGoCount > 0 
            ? `<strong>${noGoCount} account${noGoCount > 1 ? 's' : ''} show NO GO status</strong> - these configurations exceed your risk limits and should be adjusted immediately.`
            : ''
          }
          ${highRiskCount > 0 
            ? `${noGoCount > 0 ? ' Additionally, ' : ''}<strong>${highRiskCount} account${highRiskCount > 1 ? 's' : ''} show HIGH RISK</strong> - consider reducing contracts or switching strategies.`
            : ''
          }
        </p>
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 600; font-size: 0.95rem; color: #ffffff;">Accounts Requiring Action:</p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.95rem; color: #ffffff;">
            ${highRiskAccounts.map(acc => `
              <li style="margin-bottom: 0.5rem; color: #ffffff;">
                <strong>${acc.name}</strong> - ${acc.strategy} 
                (Risk: ${acc.riskLevel}, Score: ${acc.riskScore}/100)
              </li>
            `).join('')}
          </ul>
        </div>
        <p style="margin: 1rem 0 0 0; font-size: 0.95rem; color: #ffffff;">
          <strong>Recommended Actions:</strong> Reduce contract sizes, switch to micro contracts (MNQ), or consider alternative strategies with lower historical drawdowns.
        </p>
      </div>
    `;
  } else if (lowRiskCount > 0) {
    // Mixed results - mostly low risk
    summarySection = `
      <div style="
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2.5rem;">📊</div>
          <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Mixed Risk Profile</h2>
        </div>
        <p style="margin: 0; font-size: 1.1rem; opacity: 0.95;">
          ${lowRiskCount} account${lowRiskCount > 1 ? 's' : ''} show low risk, but please review the detailed table below for complete risk assessment of all accounts.
        </p>
      </div>
    `;
  }

  // Build HTML table
  let tableRows = '';
  results.forEach((result, index) => {
    const accountName = result.accountName || `Account #${result.accountNumber || index + 1}`;
    const strategy = result.strategy || 'Unknown';
    const contracts = result.contracts || 1;
    const contractType = result.contractType || 'NQ';
    const accountSize = result.accountSize ? `$${parseFloat(result.accountSize).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
    
    const metrics = result.metrics || {};
    const riskLevel = formatRiskLevel(metrics);
    const riskClass = getRiskLevelClass(riskLevel);
    const riskScore = metrics.riskScore !== undefined ? metrics.riskScore : 'N/A';
    
    // Max trailing drawdown (for Risk mode)
    const maxDrawdown = riskMode === 'risk' && result.maxDrawdown 
      ? `$${parseFloat(result.maxDrawdown).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
    
    // Safety net (for 30% Drawdown mode)
    const safetyNet = riskMode === 'apexMae' && result.safetyNet
      ? `$${parseFloat(result.safetyNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
    
    // GO/NO GO status
    const goNoGo = riskLevel === 'NO GO' || riskLevel === 'HIGH' ? 'NO GO' : 'GO';
    const goNoGoClass = goNoGo === 'NO GO' ? 'status-no-go' : 'status-go';
    
    // Warning icon for high risk
    const warningIcon = (riskLevel === 'NO GO' || riskLevel === 'HIGH') ? '⚠️ ' : '';
    
    tableRows += `
      <tr class="${riskClass}">
        <td>${warningIcon}${accountName}</td>
        <td>${strategy}</td>
        <td>${contracts} × ${contractType}</td>
        <td>${accountSize}</td>
        <td>${riskMode === 'risk' ? maxDrawdown : safetyNet}</td>
        <td class="${riskClass}"><strong>${riskLevel}</strong></td>
        <td>${riskScore}</td>
        <td class="${goNoGoClass}"><strong>${goNoGo}</strong></td>
      </tr>
    `;
  });

  // Build HTML email
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
        }
        .intro {
          margin-bottom: 30px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th {
          background: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #eee;
        }
        tr:hover {
          background: #f9f9f9;
        }
        .risk-high, .status-no-go {
          color: #ef4444;
          font-weight: 600;
        }
        .risk-medium {
          color: #f59e0b;
          font-weight: 600;
        }
        .risk-low, .status-go {
          color: #10b981;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          margin-top: 30px;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
        .cta-button:hover {
          background: #5568d3;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <h1>RiskLo Risk Summary</h1>
      <p class="intro">Here is your latest RiskLo risk summary based on your uploaded CSVs.</p>
      
      ${summarySection}
      
      <h2 style="margin-top: 2rem; margin-bottom: 1rem; color: #333; font-size: 1.25rem;">Detailed Account Analysis</h2>
      <table>
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Strategy</th>
            <th>Contracts</th>
            <th>Account Size</th>
            <th>${riskMode === 'risk' ? 'Max Trailing DD' : 'Safety Net'}</th>
            <th>Risk Level</th>
            <th>Risk Score</th>
            <th>GO/NO-GO</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <a href="${appBaseUrl}" class="cta-button">View details in RiskLo</a>
      
      <div class="footer">
        <p>This email was automatically generated by RiskLo after analyzing your uploaded CSV files.</p>
        <p>If you have any questions, please visit <a href="${appBaseUrl}">RiskLo</a>.</p>
      </div>
    </body>
    </html>
  `;

  // Build plain text fallback
  let textBody = 'RiskLo Risk Summary\n\n';
  textBody += 'Here is your latest RiskLo risk summary based on your uploaded CSVs.\n\n';
  
  // Add summary to text version
  if (lowRiskCount > 0 && (highRiskCount === 0 && noGoCount === 0)) {
    textBody += `✅ ALL ACCOUNTS SHOW LOW RISK\n`;
    textBody += `Great news! All ${lowRiskCount} account${lowRiskCount > 1 ? 's' : ''} analyzed show low risk levels.\n\n`;
  } else if (noGoCount > 0 || highRiskCount > 0) {
    const totalHighRisk = noGoCount + highRiskCount;
    textBody += `⚠️ HIGH RISK ALERT: ${totalHighRisk} Account${totalHighRisk > 1 ? 's' : ''} Require Attention\n`;
    if (noGoCount > 0) {
      textBody += `${noGoCount} account${noGoCount > 1 ? 's' : ''} show NO GO status - adjust immediately.\n`;
    }
    if (highRiskCount > 0) {
      textBody += `${highRiskCount} account${highRiskCount > 1 ? 's' : ''} show HIGH RISK - consider adjustments.\n`;
    }
    textBody += '\nAccounts Requiring Action:\n';
    highRiskAccounts.forEach(acc => {
      textBody += `  - ${acc.name} - ${acc.strategy} (Risk: ${acc.riskLevel}, Score: ${acc.riskScore}/100)\n`;
    });
    textBody += '\n';
  }
  
  textBody += 'Detailed Account Analysis:\n\n';
  
  results.forEach((result, index) => {
    const accountName = result.accountName || `Account #${result.accountNumber || index + 1}`;
    const strategy = result.strategy || 'Unknown';
    const contracts = result.contracts || 1;
    const contractType = result.contractType || 'NQ';
    const accountSize = result.accountSize ? `$${parseFloat(result.accountSize).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
    
    const metrics = result.metrics || {};
    const riskLevel = formatRiskLevel(metrics);
    const riskScore = metrics.riskScore !== undefined ? metrics.riskScore : 'N/A';
    const goNoGo = riskLevel === 'NO GO' || riskLevel === 'HIGH' ? 'NO-GO' : 'GO';
    
    textBody += `Account: ${accountName} | Strategy: ${strategy} | Contracts: ${contracts} × ${contractType} | `;
    textBody += `Account Size: ${accountSize} | Risk: ${riskLevel} (${riskScore}) | GO/NO-GO: ${goNoGo}\n`;
  });
  
  textBody += `\nView details in RiskLo: ${appBaseUrl}\n`;

  try {
    console.log('Attempting to send email to:', toEmail);
    console.log('Email from:', emailFrom);
    console.log('Using SendGrid API');
    
    const msg = {
      to: toEmail,
      from: emailFrom,
      subject: 'RiskLo Summary: Updated Risk for Your Accounts',
      html: htmlBody,
      text: textBody,
    };

    const response = await sgMail.send(msg);

    console.log('Risk summary email sent successfully');
    console.log('SendGrid response:', {
      statusCode: response[0]?.statusCode,
      headers: response[0]?.headers
    });
    
    return { success: true, messageId: response[0]?.headers['x-message-id'] || 'sent' };
  } catch (error) {
    console.error('Error sending risk summary email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      statusCode: error.response?.statusCode,
      stack: error.stack
    });
    
    // More specific error messages for SendGrid
    if (error.response) {
      const { statusCode, body } = error.response;
      console.error(`SendGrid API error: ${statusCode}`);
      if (body && body.errors) {
        console.error('SendGrid errors:', body.errors);
      }
      if (statusCode === 401) {
        console.error('Authentication failed. Check SMTP_PASS (SendGrid API key).');
      } else if (statusCode === 403) {
        console.error('Authorization failed. Check API key permissions.');
      } else if (statusCode === 400) {
        console.error('Bad request. Check EMAIL_FROM is verified in SendGrid.');
      }
    }
    
    throw error;
  }
}

module.exports = {
  sendRiskSummaryEmail,
  initializeTransporter,
};

