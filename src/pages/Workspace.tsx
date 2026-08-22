import { ChangeEvent, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  Compass,
  FileText,
  HardHat,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import './Workspace.css';
<<<<<<< HEAD
import './WorkspaceOwner.css';
import './WorkspaceSidebar.css';
import DashboardSidebar from '../components/DashboardSidebar';
=======
>>>>>>> 5714c36df0577f4836d13dd605ee11fb95f89c90
import useAuth from '../hooks/useAuth';

type View = 'overview' | 'reports' | 'milestones' | 'documents';
type Photo = { url: string; name: string; timestamp: string; location: string; status: string };
type ChatMessage = { from: 'ai' | 'owner'; text: string };

const projectOptions = [
  { name: 'Modern Villa Construction', code: 'MV-2025-014', progress: 72, color: '#d97706' },
  { name: 'Duplex Residence', code: 'DR-2025-009', progress: 45, color: '#0f766e' },
  { name: 'Office Building Project', code: 'OB-2025-006', progress: 26, color: '#64748b' },
];

const milestones = [
  { title: 'Land Preparation', date: '10 Apr 2025', state: 'complete' },
  { title: 'Foundation', date: '28 Apr 2025', state: 'complete' },
  { title: 'Columns', date: '15 May 2025', state: 'complete' },
  { title: 'Walls', date: '02 Jun 2025', state: 'complete' },
  { title: 'Roofing', date: '18 Jun 2025', state: 'active' },
  { title: 'Electrical & Plumbing', date: 'Pending', state: 'upcoming' },
];

const initialPhotos: Photo[] = [
  { url: '/src/assets/images/constructionsite.jpeg', name: 'roofing-progress.jpg', timestamp: '18 Jun 2025, 09:42', location: 'Accra, Ghana', status: 'Verified' },
  { url: '/src/assets/images/constructionsite.jpeg', name: 'column-inspection.jpg', timestamp: '15 Jun 2025, 14:18', location: 'Accra, Ghana', status: 'Verified' },
];

const navItems: { label: string; view: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', view: 'overview', icon: LayoutDashboard },
  { label: 'Progress reports', view: 'reports', icon: BarChart3 },
  { label: 'Milestones', view: 'milestones', icon: ClipboardCheck },
  { label: 'Documents', view: 'documents', icon: FileText },
];

const roleProfiles = {
  property_owner: { label: 'Property owner', greeting: 'Good morning', focus: 'Portfolio health', metric: 'Budget used' },
  professional: { label: 'Construction professional', greeting: 'Good morning', focus: 'Field operations', metric: 'Tasks today' },
  administrator: { label: 'Administrator', greeting: 'Good morning', focus: 'Platform overview', metric: 'Active projects' },
} as const;

export default function Workspace() {
  const { user } = useAuth();
  const { role: routeRole } = useParams<{ role: string }>();
  const role = (routeRole || user?.role || 'property_owner') as keyof typeof roleProfiles;
  const profile = roleProfiles[role] || roleProfiles.property_owner;
  const [view, setView] = useState<View>('overview');
  const [project, setProject] = useState(projectOptions[0]);
  const [showProjects, setShowProjects] = useState(false);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState('Accra, Ghana');
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([
    { from: 'ai', text: 'Good morning, John. Roofing is 68% complete. I found 2 updates that may need your attention.' },
    { from: 'owner', text: 'What should I review first?' },
    { from: 'ai', text: 'The latest site photos show the west elevation is ready for electrical rough-in. I can prepare a note for Mark if you would like.' },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        setLocation('Location unavailable - added manually');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const photo: Photo = {
      url: URL.createObjectURL(file),
      name: file.name,
      timestamp: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      location,
      status: 'Uploaded just now',
    };
    setPhotos((current) => [photo, ...current]);
    event.target.value = '';
  };

  const sendMessage = (text = chatInput) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChat((current) => [...current, { from: 'owner', text: trimmed }, { from: 'ai', text: 'I have noted that against Modern Villa Construction. I will surface the relevant photos, milestones, and owner updates here as they change.' }]);
    setChatInput('');
  };

  return (
    <div className="workspace-shell">
<<<<<<< HEAD
      {role === 'property_owner' ? (
        <DashboardSidebar role="property_owner" title="CamTrust" />
      ) : (
        <aside className="workspace-sidebar">
          <div className="brand-lockup"><span className="brand-mark"><HardHat size={19} /></span><span>camtrust<span className="brand-dot">.</span></span></div>
          <div className="sidebar-label">{profile.label}</div>
          <nav className="sidebar-nav" aria-label="Workspace navigation">
            {navItems.map(({ label, view: itemView, icon: Icon }) => (
              <button key={itemView} className={view === itemView ? 'sidebar-link is-active' : 'sidebar-link'} onClick={() => setView(itemView)}><Icon size={17} /><span>{label}</span>{itemView === 'reports' && <span className="nav-count">3</span>}</button>
            ))}
          </nav>
          <div className="sidebar-label sidebar-label-spaced">Workspace</div>
          <nav className="sidebar-nav">
            <button className="sidebar-link" onClick={() => sendMessage('Show my project team')}><Users size={17} /><span>Project team</span></button>
            <button className="sidebar-link" onClick={() => sendMessage('Help me with a document')}><Cloud size={17} /><span>Shared files</span></button>
            <button className="sidebar-link" onClick={() => sendMessage('Open settings')}><Settings size={17} /><span>Settings</span></button>
          </nav>
          <div className="sidebar-footer"><div className="sidebar-status"><span className="status-pulse" />All systems operational</div><div className="user-chip"><span className="avatar">JD</span><span><strong>John Doe</strong><small>Project owner</small></span><MoreHorizontal size={16} /></div></div>
        </aside>
      )}

      <main className={`workspace-main ${role === 'property_owner' ? 'with-sidebar' : ''}`}>
=======
      <aside className="workspace-sidebar">
        <div className="brand-lockup"><span className="brand-mark"><HardHat size={19} /></span><span>camtrust<span className="brand-dot">.</span></span></div>
        <div className="sidebar-label">{profile.label}</div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {navItems.map(({ label, view: itemView, icon: Icon }) => (
            <button key={itemView} className={view === itemView ? 'sidebar-link is-active' : 'sidebar-link'} onClick={() => setView(itemView)}><Icon size={17} /><span>{label}</span>{itemView === 'reports' && <span className="nav-count">3</span>}</button>
          ))}
        </nav>
        <div className="sidebar-label sidebar-label-spaced">Workspace</div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => sendMessage('Show my project team')}><Users size={17} /><span>Project team</span></button>
          <button className="sidebar-link" onClick={() => sendMessage('Help me with a document')}><Cloud size={17} /><span>Shared files</span></button>
          <button className="sidebar-link" onClick={() => sendMessage('Open settings')}><Settings size={17} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-footer"><div className="sidebar-status"><span className="status-pulse" />All systems operational</div><div className="user-chip"><span className="avatar">JD</span><span><strong>John Doe</strong><small>Project owner</small></span><MoreHorizontal size={16} /></div></div>
      </aside>

      <main className="workspace-main">
>>>>>>> 5714c36df0577f4836d13dd605ee11fb95f89c90
        <header className="workspace-header">
          <div className="breadcrumb"><span>Projects</span><span>/</span><strong>{project.name}</strong></div>
          <div className="header-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button has-notice" aria-label="Notifications"><Bell size={18} /></button><div className="header-avatar">JD</div></div>
        </header>

        <section className="content-wrap">
          <div className="project-heading">
            <div><p className="eyebrow">{profile.greeting}, {user?.fullName?.split(' ')[0] || 'John'} <span className="live-dot" /> Live updates</p><h1>{project.name}</h1><p className="project-meta"><MapPin size={14} /> East Legon, Accra <span className="meta-divider" /> {profile.focus} <span className="meta-divider" /> Project ID {project.code}</p></div>
            <div className="project-switcher-wrap"><button className="project-switcher" onClick={() => setShowProjects(!showProjects)}><span className="project-color" style={{ background: project.color }} /><span><small>Current project</small><strong>{project.name}</strong></span><ChevronDown size={17} /></button>{showProjects && <div className="project-menu">{projectOptions.map((option) => <button key={option.code} onClick={() => { setProject(option); setShowProjects(false); }}><span className="project-color" style={{ background: option.color }} /><span><strong>{option.name}</strong><small>{option.progress}% complete</small></span>{option.code === project.code && <Check size={15} />}</button>)}</div>}</div>
          </div>

          <div className="stat-grid"><Stat label="Overall progress" value={`${project.progress}%`} detail="+8.4% this month" positive /><Stat label={profile.metric} value={role === 'professional' ? '12' : role === 'administrator' ? '24' : '$162,500'} detail={role === 'professional' ? '4 due today' : role === 'administrator' ? 'Across all workspaces' : 'of $250,000'} /><Stat label="Days remaining" value="184" detail="Target: 20 Dec 2025" /><Stat label="Open items" value="07" detail="2 need attention" warning /></div>

          <div className="workspace-grid">
            <section className="panel overview-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Project health</p><h2>{view === 'overview' ? 'Construction overview' : navItems.find((item) => item.view === view)?.label}</h2></div><button className="quiet-button" onClick={() => setView(view === 'overview' ? 'reports' : 'overview')}>{view === 'overview' ? 'View reports' : 'Back to overview'} <ArrowUpRight size={15} /></button></div>
              {view === 'overview' && <><div className="progress-overview"><div className="progress-chart"><div className="chart-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-bars">{[38, 46, 52, 58, 64, 69, project.progress].map((height, index) => <div className="chart-column" key={index}><span style={{ height: `${height}%` }} /><small>W{index + 1}</small></div>)}</div></div><div className="progress-copy"><strong>On track</strong><p>Progress has risen steadily against the approved plan. Your team has closed 12 tasks this week.</p><div className="mini-bar"><span style={{ width: `${project.progress}%` }} /></div><small>Last updated 18 Jun 2025 at 10:42</small></div></div><div className="activity-list"><Activity icon={<ShieldCheck />} color="green" title="Site verification completed" text="Mark Benson uploaded a verified site report" time="Today, 10:42" /><Activity icon={<AlertTriangle />} color="amber" title="Material delivery delayed" text="Roofing sheets expected tomorrow" time="Yesterday" /><Activity icon={<MessageSquare />} color="blue" title="New owner message" text="Your engineer has replied to your question" time="Yesterday" /></div></>}
              {view === 'reports' && <Reports photos={photos} />}
              {view === 'milestones' && <div className="milestone-list">{milestones.map((milestone) => <div className={`milestone-row ${milestone.state}`} key={milestone.title}><span className="milestone-marker">{milestone.state === 'complete' ? <Check size={13} /> : milestone.state === 'active' ? <span /> : null}</span><span><strong>{milestone.title}</strong><small>{milestone.state === 'active' ? 'In progress' : milestone.state === 'complete' ? 'Completed' : 'Upcoming'}</small></span><time>{milestone.date}</time></div>)}</div>}
              {view === 'documents' && <Documents />}
            </section>

            <section className="panel capture-panel"><div className="panel-heading"><div><p className="panel-kicker">Field evidence</p><h2>Site photo log</h2></div><span className="verified-badge"><ShieldCheck size={13} /> Verified</span></div><div className="capture-dropzone" onClick={() => fileInputRef.current?.click()}><div className="capture-icon"><Camera size={22} /></div><strong>Capture or upload a photo</strong><p>Every image is stamped with time and location.</p><span className="capture-button"><Upload size={14} /> Add site photo</span><input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} hidden /></div><button className="location-button" onClick={captureLocation} type="button"><Compass size={14} /> {isLocating ? 'Detecting current location...' : `Stamp location: ${location}`}</button><div className="photo-list">{photos.slice(0, 2).map((photo) => <div className="photo-row" key={`${photo.name}-${photo.timestamp}`}><img src={photo.url} alt="Recent construction evidence" /><div><strong>{photo.name}</strong><small><span><Compass size={12} /> {photo.location}</span><span><ImageIcon size={12} /> {photo.timestamp}</span></small></div><Check className="photo-check" size={16} /></div>)}</div><button className="text-button" onClick={() => setView('reports')}>View all evidence <ArrowUpRight size={14} /></button></section>
          </div>

<<<<<<< HEAD
          {role === 'property_owner' ? (
            <section className="owner-dashboard-grid">
              <div className="owner-column">
                <section className="panel owner-summary">
                  <div className="panel-heading"><div><p className="panel-kicker">Owner Dashboard</p><h2>Overview</h2></div></div>
                  <div className="owner-summary-grid">
                    <div className="stat-card small"><span className="stat-label">Active Projects</span><strong>3</strong></div>
                    <div className="stat-card small"><span className="stat-label">Open Items</span><strong>7</strong></div>
                    <div className="stat-card small"><span className="stat-label">Budget used</span><strong>$162,500</strong></div>
                    <div className="stat-card small"><span className="stat-label">Days remaining</span><strong>184</strong></div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading"><div><p className="panel-kicker">Projects</p><h2>Your projects</h2></div><button className="quiet-button" onClick={() => setView('overview')}>View all</button></div>
                  <div className="projects-compact">
                    {projectOptions.map((p) => (
                      <div key={p.code} className="project-row">
                        <div><strong>{p.name}</strong><small className="muted">{p.code}</small></div>
                        <div className="project-progress-small">{p.progress}%</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading"><div><p className="panel-kicker">Project detail</p><h2>{project.name}</h2></div></div>
                  <div className="project-detail-compact">
                    <p className="muted">{project.code} • {projectOptions[0].progress}% complete</p>
                    <p>Location: East Legon, Accra</p>
                    <p>Manager: Mark Benson</p>
                  </div>
                </section>
              </div>

              <div className="owner-column">
                <section className="panel"><div className="panel-heading"><div><p className="panel-kicker">Milestones</p><h2>Timeline</h2></div></div><div className="timeline">{milestones.map((milestone) => <div className={`timeline-item ${milestone.state}`} key={milestone.title}><span className="timeline-line" /><span className="timeline-dot" /><div><strong>{milestone.title}</strong><small>{milestone.state === 'active' ? 'In progress' : milestone.state === 'complete' ? 'Completed' : 'Upcoming'}</small></div><time>{milestone.date}</time></div>)}</div></section>

                <section className="panel"><div className="panel-heading"><div><p className="panel-kicker">Progress reports</p><h2>Latest reports</h2></div></div><Reports photos={photos} /></section>

                <section className="panel update-progress"><div className="panel-heading"><div><p className="panel-kicker">Update Progress</p><h2>Submit update</h2></div></div><p className="muted">Post a short update and upload site photos.</p><div style={{marginTop:12}}><button className="capture-button" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Add site photo</button></div></section>
              </div>

              <div className="owner-column">
                <section className="panel"><div className="panel-heading"><div><p className="panel-kicker">Documents</p><h2>Project files</h2></div></div><Documents /></section>

                <section className="panel"><div className="panel-heading"><div><p className="panel-kicker">Notifications</p><h2>Recent alerts</h2></div></div><div className="activity-list"><Activity icon={<AlertTriangle />} color="amber" title="Material delivery delayed" text="Roofing sheets expected tomorrow" time="Yesterday" /><Activity icon={<MessageSquare />} color="blue" title="New owner message" text="Your engineer has replied" time="Yesterday" /></div></section>

                <section className="panel"><div className="panel-heading"><div><p className="panel-kicker">Team</p><h2>Professionals</h2></div></div><div className="team-list"><div className="team-row"><strong>Mark Benson</strong><small className="muted">Site Engineer</small></div><div className="team-row"><strong>Paulina A.</strong><small className="muted">Architect</small></div></div></section>
              </div>
            </section>
          ) : (
            <section className="bottom-grid"><section className="panel timeline-panel"><div className="panel-heading"><div><p className="panel-kicker">Schedule</p><h2>Upcoming milestones</h2></div><button className="icon-button" aria-label="More milestone options"><MoreHorizontal size={18} /></button></div><div className="timeline">{milestones.slice(3, 6).map((milestone) => <div className={`timeline-item ${milestone.state}`} key={milestone.title}><span className="timeline-line" /><span className="timeline-dot" /><div><strong>{milestone.title}</strong><small>{milestone.state === 'active' ? 'In progress' : 'Upcoming'}</small></div><time>{milestone.date}</time></div>)}</div></section><section className="panel ai-panel"><div className="panel-heading"><div className="ai-title"><span className="ai-icon"><Sparkles size={15} /></span><div><p className="panel-kicker">CamTrust intelligence</p><h2>Project assistant</h2></div></div><span className="online-label"><span /> Online</span></div><div className="chat-window">{chat.slice(-3).map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}>{message.from === 'ai' && <span className="mini-ai"><Bot size={13} /></span>}<p>{message.text}</p></div>)}</div><div className="suggestion-row"><button onClick={() => sendMessage('Summarize this week')}>Summarize this week</button><button onClick={() => sendMessage('What needs attention?')}>What needs attention?</button></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about your project..." aria-label="Ask the project assistant" /><button type="submit" aria-label="Send message"><Send size={16} /></button></form></section></section>
          )}
=======
          <section className="bottom-grid"><section className="panel timeline-panel"><div className="panel-heading"><div><p className="panel-kicker">Schedule</p><h2>Upcoming milestones</h2></div><button className="icon-button" aria-label="More milestone options"><MoreHorizontal size={18} /></button></div><div className="timeline">{milestones.slice(3, 6).map((milestone) => <div className={`timeline-item ${milestone.state}`} key={milestone.title}><span className="timeline-line" /><span className="timeline-dot" /><div><strong>{milestone.title}</strong><small>{milestone.state === 'active' ? 'In progress' : 'Upcoming'}</small></div><time>{milestone.date}</time></div>)}</div></section><section className="panel ai-panel"><div className="panel-heading"><div className="ai-title"><span className="ai-icon"><Sparkles size={15} /></span><div><p className="panel-kicker">CamTrust intelligence</p><h2>Project assistant</h2></div></div><span className="online-label"><span /> Online</span></div><div className="chat-window">{chat.slice(-3).map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}>{message.from === 'ai' && <span className="mini-ai"><Bot size={13} /></span>}<p>{message.text}</p></div>)}</div><div className="suggestion-row"><button onClick={() => sendMessage('Summarize this week')}>Summarize this week</button><button onClick={() => sendMessage('What needs attention?')}>What needs attention?</button></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about your project..." aria-label="Ask the project assistant" /><button type="submit" aria-label="Send message"><Send size={16} /></button></form></section></section>
>>>>>>> 5714c36df0577f4836d13dd605ee11fb95f89c90
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, detail, positive, warning }: { label: string; value: string; detail: string; positive?: boolean; warning?: boolean }) { return <div className="stat-card"><span className="stat-label">{label}</span><strong>{value}</strong><small className={positive ? 'positive' : warning ? 'warning' : ''}>{positive && <ArrowUpRight size={12} />}{warning && <AlertTriangle size={12} />}{detail}</small></div>; }
function Activity({ icon, color, title, text, time }: { icon: React.ReactNode; color: string; title: string; text: string; time: string }) { return <div className="activity-row"><span className={`activity-icon ${color}`}>{icon}</span><span><strong>{title}</strong><small>{text}</small></span><time>{time}</time></div>; }
function Reports({ photos }: { photos: Photo[] }) { return <div className="report-view"><div className="report-hero"><div><strong>Weekly progress report</strong><p>Week 24 · 10 - 16 Jun 2025</p></div><span className="report-score">+8.4%</span></div><div className="report-chart"><span style={{ height: '38%' }} /><span style={{ height: '49%' }} /><span style={{ height: '44%' }} /><span style={{ height: '63%' }} /><span style={{ height: '58%' }} /><span style={{ height: '78%' }} /><span style={{ height: '72%' }} /></div><div className="report-caption"><span>10 Jun</span><span>16 Jun</span></div><div className="report-note"><Check size={15} /><span>{photos.length} verified field photos attached to this report</span></div></div>; }
function Documents() { return <div className="document-list">{['Architectural Plans', 'Building Permit', 'Contract Agreement', 'Safety Plan'].map((document, index) => <div className="document-row" key={document}><span className="document-icon"><FileText size={17} /></span><span><strong>{document}</strong><small>{index === 0 ? 'PDF · 2.4 MB · 15 May 2025' : 'PDF · Verified · 12 Jun 2025'}</small></span><button className="icon-button" aria-label={`Open ${document}`}><ArrowUpRight size={15} /></button></div>)}</div>; }
