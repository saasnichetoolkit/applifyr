export const categories = [
  // Productivity & Workflow (8)
  { slug: "task_management", label: "Task Management", code: "TM", description: "Task trackers, to-do lists, project boards." },
  { slug: "note_taking", label: "Note Taking", code: "NT", description: "Digital notebooks, knowledge bases, second brains." },
  { slug: "time_tracking", label: "Time Tracking", code: "TT", description: "Time trackers, Pomodoro timers, focus apps." },
  { slug: "automation", label: "Automation", code: "AU", description: "Zapier alternatives, workflow automation, IFTTT clones." },
  { slug: "calendar_scheduling", label: "Calendar & Scheduling", code: "CS", description: "Meeting schedulers, calendar sync, booking tools." },
  { slug: "file_management", label: "File Management", code: "FM", description: "Cloud storage, file organizers, document managers." },
  { slug: "email_management", label: "Email Management", code: "EM", description: "Email filters, inbox zero tools, email trackers." },
  { slug: "distraction_blocking", label: "Distraction Blocking", code: "DB", description: "Focus apps, website blockers, screen time limits." },
  
  // Developer Tools (8)
  { slug: "api_tools", label: "API Tools", code: "AT", description: "API testing, mock servers, API documentation." },
  { slug: "code_editors", label: "Code Editors", code: "CE", description: "Web-based IDEs, code snippets, syntax checkers." },
  { slug: "devops_ci_cd", label: "DevOps & CI/CD", code: "DC", description: "Deployment pipelines, server monitoring, CI/CD tools." },
  { slug: "database_tools", label: "Database Tools", code: "DT", description: "SQL editors, database GUIs, data migration." },
  { slug: "testing_qa", label: "Testing & QA", code: "TQ", description: "Automated testing, QA tools, bug trackers." },
  { slug: "security_dev", label: "Security (Dev)", code: "SD", description: "Security scanners, vulnerability checkers, auth tools." },
  { slug: "version_control", label: "Version Control", code: "VC", description: "Git helpers, repo managers, commit analyzers." },
  { slug: "low_code_no_code", label: "Low/No Code", code: "LC", description: "Visual builders, drag-drop apps, form builders." },
  
  // Business & Finance (8)
  { slug: "accounting_bookkeeping", label: "Accounting & Bookkeeping", code: "AB", description: "Invoicing, expense tracking, financial reports." },
  { slug: "payroll_hr", label: "Payroll & HR", code: "PH", description: "Payroll processing, employee management, benefits." },
  { slug: "crm_sales", label: "CRM & Sales", code: "CR", description: "Customer relationship management, sales pipelines." },
  { slug: "e_commerce_tools", label: "E-Commerce Tools", code: "EC", description: "Shopify apps, inventory management, checkout tools." },
  { slug: "marketing_automation", label: "Marketing Automation", code: "MA", description: "Email campaigns, social media schedulers." },
  { slug: "analytics_reporting", label: "Analytics & Reporting", code: "AR", description: "Web analytics, business intelligence, dashboards." },
  { slug: "tax_compliance", label: "Tax & Compliance", code: "TC", description: "Tax calculators, compliance trackers, filing tools." },
  { slug: "investment_crypto", label: "Investment & Crypto", code: "IC", description: "Portfolio trackers, crypto exchanges, stock analysis." },
  
  // Creative & Design (8)
  { slug: "graphic_design", label: "Graphic Design", code: "GD", description: "Logo makers, vector editors, design templates." },
  { slug: "video_editing", label: "Video Editing", code: "VE", description: "Video cutters, filters, animation tools." },
  { slug: "audio_production", label: "Audio Production", code: "AP", description: "Podcast editors, music makers, sound libraries." },
  { slug: "photo_editing", label: "Photo Editing", code: "PE", description: "Photo filters, retouching, image optimization." },
  { slug: "3d_modeling", label: "3D Modeling", code: "3D", description: "3D renderers, CAD tools, VR/AR creators." },
  { slug: "writing_content", label: "Writing & Content", code: "WC", description: "Copywriting assistants, blog generators, SEO writers." },
  { slug: "presentation_deck", label: "Presentation & Deck", code: "PD", description: "Slide makers, pitch deck builders, infographics." },
  { slug: "branding_identity", label: "Branding & Identity", code: "BI", description: "Brand guidelines, color palettes, font pairing." },
  
  // AI & Machine Learning (6)
  { slug: "chatbots_conversational", label: "Chatbots & Conversational", code: "CC", description: "Chatbots, virtual assistants, Q&A systems." },
  { slug: "image_generation", label: "Image Generation", code: "IG", description: "AI art generators, image upscalers, style transfer." },
  { slug: "text_generation", label: "Text Generation", code: "TG", description: "AI writers, summarizers, content expanders." },
  { slug: "data_analysis_ai", label: "Data Analysis (AI)", code: "DA", description: "AI-powered analytics, pattern recognition, forecasting." },
  { slug: "voice_synthesis", label: "Voice Synthesis", code: "VS", description: "Text-to-speech, voice cloning, audio generation." },
  { slug: "recommendation_engine", label: "Recommendation Engine", code: "RE", description: "Personalized feeds, product recommenders, matching." },
  
  // Niche & Emerging (8)
  { slug: "health_wellness", label: "Health & Wellness", code: "HW", description: "Fitness trackers, meditation apps, health monitors." },
  { slug: "education_learning", label: "Education & Learning", code: "EL", description: "Online courses, tutoring platforms, skill builders." },
  { slug: "social_networking", label: "Social Networking", code: "SN", description: "Community builders, interest groups, networking." },
  { slug: "gaming_entertainment", label: "Gaming & Entertainment", code: "GE", description: "Game tools, trivia, entertainment apps." },
  { slug: "travel_planning", label: "Travel Planning", code: "TP", description: "Trip planners, itinerary builders, booking tools." },
  { slug: "real_estate", label: "Real Estate", code: "RE", description: "Property search, mortgage calculators, rental managers." },
  { slug: "legal_compliance", label: "Legal & Compliance", code: "LC", description: "Legal docs, contract generators, compliance trackers." },
  { slug: "reentry_workforce", label: "Reentry & Workforce", code: "RW", description: "Job matching for justice-impacted, skills training." },
  
  // Utilities & Infrastructure (6)
  { slug: "security_privacy", label: "Security & Privacy", code: "SP", description: "Password managers, encryption, privacy tools." },
  { slug: "system_utilities", label: "System Utilities", code: "SU", description: "Disk cleaners, backup tools, performance monitors." },
  { slug: "other", label: "Other", code: "OT", description: "Useful software that crosses categories or creates a new one." },
] as const;

export const categoryLabels: Record<string, string> = Object.fromEntries(categories.map((item) => [item.slug, item.label]));
