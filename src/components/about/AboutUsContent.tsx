import React from 'react';
import { Link } from 'react-router-dom';

export type AboutSectionId = 'overview' | 'contact' | 'refund' | 'terms-privacy';

export interface AboutSectionLink {
  id: AboutSectionId;
  label: string;
  path: string;
}

export const ABOUT_SECTION_LINKS: AboutSectionLink[] = [
  { id: 'overview', label: 'About the University', path: '/about-us' },
  { id: 'contact', label: 'Contact Us', path: '/about-us/contact' },
  { id: 'refund', label: 'Refund & Cancellation', path: '/about-us/refund' },
  { id: 'terms-privacy', label: 'Terms & Privacy', path: '/about-us/terms-privacy' },
];

interface AboutContentProps {
  section: AboutSectionId;
}

const AboutUsContent: React.FC<AboutContentProps> = ({ section }) => {
  if (section === 'contact') {
    return (
      <section className="about-content-panel" aria-labelledby="about-content-title">
        <p className="about-eyebrow">WE ARE HERE TO HELP</p>
        <h1 id="about-content-title">Contact Us</h1>
        <p className="about-lead">Get in touch with Andhra Kesari University for university and portal-related assistance.</p>
        <div className="about-info-grid">
          <article className="about-info-card">
            <span className="about-info-icon" aria-hidden="true">⌖</span>
            <h2>University address</h2>
            <address>The Registrar<br />Andhra Kesari University<br />Pelluru Colony, Ongole – 523 001<br />Prakasam District, Andhra Pradesh, India</address>
          </article>
          <article className="about-info-card">
            <span className="about-info-icon" aria-hidden="true">☎</span>
            <h2>For queries</h2>
            <div className="about-contact-links">
              <a className="about-contact-link" href="mailto:regakuongole@gmail.com">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                <span><small>Email</small>REGAKUONGOLE@GMAIL.COM</span>
              </a>
              <a className="about-contact-link" href="tel:9491756938">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h3l1.5 4-2 1.7a14 14 0 0 0 5.8 5.8l1.7-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 5 5.2 2 2 0 0 1 7 3Z" /></svg>
                <span><small>Phone</small>+91 94917 56938</span>
              </a>
            </div>
          </article>
          <article className="about-info-card">
            <span className="about-info-icon" aria-hidden="true">↗</span>
            <h2>University website</h2>
            <p><a href="https://akuprakasam.ac.in/" target="_blank" rel="noreferrer">akuprakasam.ac.in</a></p>
            <small>Visit the Andhra Kesari University website</small>
          </article>
        </div>
      </section>
    );
  }

  if (section === 'refund') {
    return (
      <section className="about-content-panel" aria-labelledby="about-content-title">
        <p className="about-eyebrow">PAYMENTS AND APPLICATIONS</p>
        <h1 id="about-content-title">Refund &amp; Cancellation Policy</h1>
        <p className="about-lead">Please review these conditions before paying a fee for a university application or service.</p>
        <article className="about-policy-card">
          <h2>Policy information</h2>
          <ol className="about-policy-list">
            <li>The fee, once paid against a candidate, cannot be exchanged, cancelled or refunded.</li>
            <li>Payment is made only for the purpose selected in the application. The candidate must submit the application online using the payment details and complete both the application and payment within the stipulated date and time. The service will be offered only after payment is completed.</li>
            <li>Payment does not establish eligibility for the selected purpose. The AKU committee will verify the candidate's application according to university rules and guidelines and decide whether to accept or reject it. Candidates should apply and pay only if they believe they are eligible. Once payment is made, no refund or cancellation will be permitted.</li>
            <li>Any legal disputes should be limited to Visakhapatnam jurisdiction.</li>
          </ol>
          <p className="about-policy-note"><strong>For queries:</strong> Contact the Computer Centre, Andhra Kesari University.</p>
        </article>
      </section>
    );
  }

  if (section === 'terms-privacy') {
    return (
      <section className="about-content-panel" aria-labelledby="about-content-title">
        <p className="about-eyebrow">INFORMATION AND PORTAL USE</p>
        <h1 id="about-content-title">Terms &amp; Privacy</h1>
        <p className="about-lead">This statement describes how the university portal handles information and the conditions for using its services. The policy may change without prior notice; please review it periodically.</p>

        <div className="about-policy-sections">
          <article className="about-policy-card">
            <h2>1. Payment security</h2>
            <p>The site has security measures to protect information under its control from loss, misuse and alteration. When you access or change account information, a secure server is offered. Once information is received, strict security guidelines are followed to protect it against unauthorised access.</p>
            <p>The AKUExams.com website states that online transactions with the AKU website take place in a secure environment using Secure Socket Layer (SSL) technology on the AUCOE website.</p>
          </article>

          <article className="about-policy-card">
            <h2>2. Collection of personally identifiable information</h2>
            <p>Personally identifiable information, such as email address, name and contact number, is collected when you apply for AUCOE services. Some sections can be browsed without applying. Activities such as applying for AKU examinations and checking application or complaint status require registration. Contact information may be used to send you information when needed.</p>
          </article>

          <article className="about-policy-card">
            <h2>3. Use of demographic and profile data</h2>
            <p>Personal information is used for the smooth conduct of AKU services and to check eligibility to appear for AKU examinations under Government Orders issued by the Andhra Pradesh Government. It may also be used to resolve disputes, troubleshoot problems, promote a safe service, collect fees owed, detect and protect against errors, fraud and other criminal activity, enforce terms and conditions, and for purposes described when information is collected.</p>
            <p>To improve products and services, demographic and profile data about website activity may be collected and analysed. The IP address may be used to diagnose server problems, administer the website, identify users and gather broad demographic information. AKU is not responsible for credit/debit card or net-banking details used by the banker.</p>
          </article>

          <article className="about-policy-card">
            <h2>4. Cookies</h2>
            <p>A cookie is a small piece of information stored by a web server in a browser so it can be read later. Cookies help a browser remember information for a user. AKU places permanent and temporary cookies on your computer; AKU cookies do not contain personally identifiable information.</p>
          </article>

          <article className="about-policy-card">
            <h2>5. Sharing of personal information</h2>
            <p>Personal information may be shared with education department and related department entities and affiliates to help detect and prevent identity theft, fraud and other potentially illegal acts, and to correlate related or multiple accounts to prevent abuse of services.</p>
            <p>Information may be disclosed when required by law or when disclosure is reasonably necessary to respond to court orders or other legal process. It may also be disclosed to law-enforcement offices, third-party rights owners or others when reasonably necessary to enforce the Terms or Privacy Policy, respond to claims, or protect the rights, property or personal safety of users or the public.</p>
          </article>

          <article className="about-policy-card">
            <h2>6. Prohibition against unlawful use</h2>
            <p>As a condition of using the AKU website, users agree not to use it for a purpose that is unlawful or prohibited by this agreement. Users must not damage, disable, overburden or impair the website, interfere with another party's use, or try to obtain materials or information by means not intentionally made available through the website.</p>
          </article>

          <article className="about-policy-card">
            <h2>7. Links to other sites</h2>
            <p>The site may link to other websites that collect personally identifiable information. The AKU committee is not responsible for the privacy practices or content of those linked websites.</p>
          </article>

          <article className="about-policy-card">
            <h2>8. Use of communication services</h2>
            <p>Communication services are to be used only to post, send and receive messages and material that are proper and related to AKU. Users agree not to:</p>
            <ul className="about-policy-list">
              <li>Defame, abuse, harass, stalk, threaten or violate the legal rights of others.</li>
              <li>Upload material protected by intellectual property laws unless they own or control the rights or have the necessary consent.</li>
              <li>Upload or distribute viruses, corrupted files or other software that may damage the AKU website or another computer.</li>
              <li>Conduct or forward surveys, contests, pyramid schemes or chain letters.</li>
              <li>Download files when they know, or reasonably should know, that the files cannot legally be distributed in that way.</li>
              <li>Falsify or delete author attributions, legal notices, proprietary designations or labels identifying the source of uploaded material.</li>
              <li>Violate a code of conduct, applicable law or regulation, or the terms and conditions for use of the website.</li>
            </ul>
            <p>Andhra Kesari University reserves the right to disclose information required to comply with applicable law, regulation, legal process or government requests, and to edit, refuse to post or remove material at its discretion.</p>
            <p>The university does not control or endorse content, messages or information found in a communication service and disclaims responsibility for the services and actions resulting from user participation. Materials uploaded to a communication service may have usage, reproduction or distribution limits; users are responsible for knowing and following those limits.</p>
          </article>

          <article className="about-policy-card">
            <h2>9. Termination or access restriction</h2>
            <p>AKU reserves the right, at its discretion, to terminate access to the website and related services, or any portion of them, at any time without notice.</p>
          </article>

          <article className="about-policy-card">
            <h2>10. Questions</h2>
            <p>Questions regarding this statement should be directed to <a href="https://www.aucoe.info/" target="_blank" rel="noreferrer">www.aucoe.info</a>.</p>

          </article>
        </div>
        <p className="about-policy-note"><strong>For queries:</strong> Contact the Computer Centre, Andhra Kesari University.</p>
      </section>
    );
  }

  return (
    <section className="about-content-panel about-overview-panel" aria-labelledby="about-content-title">
      <p className="about-eyebrow">ANDHRA KESARI UNIVERSITY · ONGOLE</p>
      <h1 id="about-content-title">About Andhra Kesari University</h1>
      <p className="about-lead">Andhra Kesari University is a state university established by the Government of Andhra Pradesh under Act No. 21 of 2021, with effect from 11 January 2022.</p>

      <div className="about-info-grid about-facts-grid">
        <article className="about-info-card"><span className="about-info-icon" aria-hidden="true">⌂</span><h2>University location</h2><p>Ongole, Prakasam District, Andhra Pradesh</p></article>
        <article className="about-info-card"><span className="about-info-icon" aria-hidden="true">◷</span><h2>Established</h2><p>11 January 2022</p></article>
        <article className="about-info-card"><span className="about-info-icon" aria-hidden="true">▤</span><h2>Academic roots</h2><p>Acharya Nagarjuna University Post-Graduation Centre, Ongole (established 1993)</p></article>
      </div>

      <div className="about-overview-sections">
        <article className="about-policy-card">
          <h2>University profile</h2>
          <p>Prakasam District, with its headquarters at Ongole, is named after the late Chief Minister of Andhra State, Andhra Kesari Tanguturi Prakasam Pantulu. Against the background of the district's needs in economic development and higher education, the Acharya Nagarjuna University Post-Graduation Centre was established at Ongole in 1993. It was later upgraded to Andhra Kesari University in memory of Tanguturi Prakasam Pantulu.</p>
          <p>The Government of Andhra Pradesh established the university as a state university with effect from 11 January 2022 under Act No. 21 of 2021. The university is empowered to award degrees as specified by Section 22 of the UGC Act, 1956 and the Andhra Pradesh University Act.</p>
        </article>
        <article className="about-policy-card">
          <h2>Programmes and research</h2>
          <p>The university college offers postgraduate programmes and an undergraduate programme across the following subjects:</p>
          <ul className="about-course-list">
            <li>M.A. History</li><li>M.A. Economics</li><li>Master of Social Work (M.S.W.)</li><li>Master of Education (M.Ed.)</li><li>M.Com.</li><li>M.B.A.</li><li>M.Sc. Mathematics</li><li>M.Sc. Statistics</li><li>Master of Physical Education (M.P.Ed.)</li><li>Bachelor of Physical Education (B.P.Ed.)</li>
            <li>M.Sc. Aquaculture</li><li>M.Sc. Organic Chemistry</li><li>M.Sc. Analytical Chemistry</li><li>M.Sc. Computer Science</li><li>M.Sc. Environmental Science &amp; Technology</li><li>M.A. English</li><li>M.A. Telugu</li>
          </ul>
          <p>Departments have eligible guides to support research leading to Ph.D. programmes.</p>
        </article>
        <article className="about-policy-card">
          <h2>Founding leadership</h2>
          <p><strong>Anji Reddy Mareddy</strong>, Professor of Environmental Sciences &amp; Technology at Jawaharlal Nehru Technological University, Hyderabad, was appointed founding Vice-Chancellor on 9 February 2023.</p>
          <p><strong>B. Hari Babu</strong>, Department of Chemistry, Acharya Nagarjuna University, Guntur, was appointed founding Registrar on 16 March 2023.</p>
        </article>
      </div>

      <div className="about-portal-callout">
        <div><strong>UG College Portal</strong><p>Access examination services, results, academic notices and college support from the portal.</p></div>
        <Link className="about-action-link" to="/login">Go to college login <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
};

export default AboutUsContent;
