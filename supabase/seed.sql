-- Seed default templates
insert into public.templates (name, description, category, doc_type, is_premium, prompt_template) values
  ('Business Report', 'Professional business analysis report with executive summary', 'Business', 'pdf', false, 'Write a comprehensive business report about {topic}. Include executive summary, analysis, findings, and recommendations.'),
  ('Project Proposal', 'Formal project proposal with timeline and budget sections', 'Business', 'docx', false, 'Create a formal project proposal for {topic}. Include objectives, scope, timeline, budget, and expected outcomes.'),
  ('Research Paper', 'Academic research paper with citations structure', 'Academic', 'pdf', false, 'Write an academic research paper on {topic}. Include abstract, introduction, methodology, findings, discussion, and conclusion.'),
  ('Resume / CV', 'ATS-optimized professional resume template', 'Career', 'docx', false, 'Create a professional resume for {topic}. Include summary, experience, skills, education sections.'),
  ('Pitch Deck', 'Investor pitch deck with compelling slides', 'Business', 'pptx', true, 'Create a compelling investor pitch deck about {topic}. Include problem, solution, market size, business model, traction, team, and ask slides.'),
  ('Sales Presentation', 'Persuasive sales presentation deck', 'Business', 'pptx', true, 'Create a sales presentation for {topic}. Include value proposition, benefits, case studies, pricing, and call to action.'),
  ('Financial Report', 'Excel spreadsheet with financial data and charts', 'Finance', 'xlsx', true, 'Create a financial report spreadsheet for {topic}. Include revenue, expenses, profit/loss, and forecasting data with charts.'),
  ('Data Dashboard', 'Excel data dashboard with multiple charts', 'Analytics', 'xlsx', true, 'Create a data analytics dashboard for {topic}. Include summary metrics, trend data, and comparative analysis with charts.'),
  ('Cover Letter', 'Professional cover letter for job applications', 'Career', 'docx', false, 'Write a compelling cover letter for {topic}. Include opening hook, relevant experience, why this company, and strong closing.'),
  ('Meeting Minutes', 'Structured meeting minutes with action items', 'Business', 'docx', false, 'Create meeting minutes for {topic}. Include attendees, agenda items, discussion points, decisions made, and action items.'),
  ('Marketing Plan', 'Comprehensive marketing strategy document', 'Marketing', 'pdf', false, 'Create a marketing plan for {topic}. Include market analysis, target audience, strategy, channels, budget, and KPIs.'),
  ('Training Manual', 'Step-by-step employee training guide', 'HR', 'docx', false, 'Create a training manual for {topic}. Include objectives, procedures, best practices, and assessment criteria.');
