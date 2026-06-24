import { useState } from 'react';
import './App.css';

function App() {
  const [launches, setLaunches] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    timeline: '',
    status: 'planning'
  });
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const requirements = {
    client: { label: 'Client Requirements', color: '#FF6B6B' },
    technical: { label: 'Technical Requirements', color: '#4ECDC4' },
    ux: { label: 'UX/Design Requirements', color: '#45B7D1' },
    compliance: { label: 'Compliance & Security', color: '#F7B731' },
    business: { label: 'Business Goals & ROI', color: '#5F27CD' }
  };

  const handleAddLaunch = () => {
    if (formData.name && formData.client) {
      const newLaunch = {
        id: Date.now(),
        ...formData,
        checklist: {
          client: false,
          technical: false,
          ux: false,
          compliance: false,
          business: false
        },
        metrics: {
          adoptionRate: 0,
          roi: 0,
          userSatisfaction: 0
        }
      };
      setLaunches([...launches, newLaunch]);
      setFormData({ name: '', client: '', timeline: '', status: 'planning' });
      setSelectedLaunch(newLaunch.id);
    }
  };

  const toggleRequirement = (launchId, reqType) => {
    setLaunches(launches.map(launch => 
      launch.id === launchId 
        ? { ...launch, checklist: { ...launch.checklist, [reqType]: !launch.checklist[reqType] } }
        : launch
    ));
  };

  const updateMetrics = (launchId, metric, value) => {
    setLaunches(launches.map(launch =>
      launch.id === launchId
        ? { ...launch, metrics: { ...launch.metrics, [metric]: parseInt(value) || 0 } }
        : launch
    ));
  };

  const getAiSuggestions = async (launchId) => {
    const launch = launches.find(l => l.id === launchId);
    if (!launch) return;

    setLoading(true);
    try {
      const checkedReqs = Object.values(launch.checklist).filter(Boolean).length;
      const totalReqs = Object.keys(launch.checklist).length;
      const completionRate = Math.round((checkedReqs / totalReqs) * 100);

      const suggestions = generateSuggestions(launch, completionRate);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (launch, completionRate) => {
    const suggestions = [];
    
    if (completionRate < 80) {
      suggestions.push({
        priority: 'high',
        text: `Complete ${100 - completionRate}% of requirements before launch. Priority: ${Object.keys(launch.checklist).find(k => !launch.checklist[k]) || 'business'} requirements.`
      });
    }

    if (!launch.checklist.compliance) {
      suggestions.push({
        priority: 'critical',
        text: 'Compliance & Security checklist is incomplete. Schedule security review and regulatory audit.'
      });
    }

    if (launch.metrics.roi === 0) {
      suggestions.push({
        priority: 'high',
        text: 'Define ROI metrics. Baseline: expected adoption rate, cost savings, and revenue impact.'
      });
    }

    if (launch.status === 'planning') {
      suggestions.push({
        priority: 'medium',
        text: 'Move to "in-progress" once technical and UX requirements are approved by stakeholders.'
      });
    }

    return suggestions.length > 0 ? suggestions : [{ priority: 'low', text: '✓ Product is on track. Continue monitoring post-launch metrics.' }];
  };

  const currentLaunch = launches.find(l => l.id === selectedLaunch);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Product Delivery Tracker</h1>
        <p>Track requirements, manage delivery, measure ROI</p>
      </header>

      <div className="app-content">
        <div className="card add-launch">
          <h2>New Product Launch</h2>
          <input
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            placeholder="Client Name"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
          <input
            placeholder="Timeline (e.g., Q3 2026)"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="launch">Launch</option>
            <option value="post-launch">Post-Launch</option>
          </select>
          <button onClick={handleAddLaunch} className="btn-primary">Add Launch</button>
        </div>

        <div className="launches-grid">
          <div className="launches-list">
            <h2>Active Launches ({launches.length})</h2>
            {launches.length === 0 ? (
              <p className="empty-state">No launches yet. Create one to get started.</p>
            ) : (
              launches.map(launch => (
                <div
                  key={launch.id}
                  className={`launch-item ${selectedLaunch === launch.id ? 'active' : ''}`}
                  onClick={() => setSelectedLaunch(launch.id)}
                >
                  <h3>{launch.name}</h3>
                  <p className="client">{launch.client}</p>
                  <p className="timeline">{launch.timeline}</p>
                  <span className={`status status-${launch.status}`}>{launch.status}</span>
                </div>
              ))
            )}
          </div>

          {currentLaunch && (
            <div className="launch-detail">
              <h2>{currentLaunch.name}</h2>
              <p className="detail-info">Client: {currentLaunch.client} | Timeline: {currentLaunch.timeline}</p>

              <div className="checklist-section">
                <h3>Requirement Checklist</h3>
                {Object.entries(requirements).map(([key, { label, color }]) => (
                  <label key={key} className="checkbox-item" style={{ borderLeftColor: color }}>
                    <input
                      type="checkbox"
                      checked={currentLaunch.checklist[key]}
                      onChange={() => toggleRequirement(currentLaunch.id, key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.round(
                        (Object.values(currentLaunch.checklist).filter(Boolean).length /
                          Object.keys(currentLaunch.checklist).length) * 100
                      )}%`
                    }}
                  />
                </div>
                <p className="completion-text">
                  {Object.values(currentLaunch.checklist).filter(Boolean).length} of{' '}
                  {Object.keys(currentLaunch.checklist).length} requirements completed
                </p>
              </div>

              <div className="metrics-section">
                <h3>Post-Launch Metrics</h3>
                <div className="metric-input">
                  <label>Adoption Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentLaunch.metrics.adoptionRate}
                    onChange={(e) => updateMetrics(currentLaunch.id, 'adoptionRate', e.target.value)}
                  />
                </div>
                <div className="metric-input">
                  <label>ROI (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={currentLaunch.metrics.roi}
                    onChange={(e) => updateMetrics(currentLaunch.id, 'roi', e.target.value)}
                  />
                </div>
                <div className="metric-input">
                  <label>User Satisfaction (1-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={currentLaunch.metrics.userSatisfaction}
                    onChange={(e) => updateMetrics(currentLaunch.id, 'userSatisfaction', e.target.value)}
                  />
                </div>
              </div>

              <button onClick={() => getAiSuggestions(currentLaunch.id)} className="btn-ai">
                {loading ? 'Generating...' : '🤖 Get AI Suggestions'}
              </button>

              {aiSuggestions && (
                <div className="suggestions-section">
                  <h3>AI Coaching</h3>
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className={`suggestion suggestion-${suggestion.priority}`}>
                      <span className="priority-badge">{suggestion.priority.toUpperCase()}</span>
                      <p>{suggestion.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        <p>Built with React + Vite | AI-Powered Product Management</p>
      </footer>
    </div>
  );
}

export default App;
