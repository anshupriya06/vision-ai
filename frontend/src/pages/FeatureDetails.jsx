import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FeatureDetails = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to the section if hash is present
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Feature Deep Dive</span>
          </h1>
          <p className="text-xl text-gray-400">
            Learn how our AI-powered park safety system keeps public spaces secure
          </p>
        </div>

        {/* Activity Detection Section */}
        <section id="activity-detection" className="mb-20 glassmorphism p-10 rounded-xl scroll-mt-20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-accent to-blue-600 p-4 rounded-xl text-white mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Real-time Activity Detection</h2>
          </div>

          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Our advanced AI system uses cutting-edge computer vision models to monitor park activities in real-time, 
              providing instant classification of behaviors to identify potential safety concerns before they escalate.
            </p>

            <div className="border-l-4 border-accent pl-6 py-2">
              <h3 className="text-xl font-semibold text-white mb-3">Technology Stack</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-white">YOLOv8:</strong> State-of-the-art object detection for identifying people, vehicles, and objects in video frames</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-white">MediaPipe:</strong> Real-time pose estimation to analyze human body positions and movements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-white">Random Forest Classifier:</strong> Machine learning model trained to classify activities based on pose features</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Detected Activity Classes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-safe/10 border border-safe/30 rounded-lg p-4">
                  <h4 className="text-safe font-bold mb-2">Safe Activities (4)</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Walking</li>
                    <li>✓ Sitting</li>
                    <li>✓ Standing Still</li>
                    <li>✓ Yoga/Exercise</li>
                  </ul>
                </div>
                <div className="bg-unsafe/10 border border-unsafe/30 rounded-lg p-4">
                  <h4 className="text-unsafe font-bold mb-2">Unsafe Activities (4)</h4>
                  <ul className="space-y-1 text-sm">
                    <li>⚠ Fighting/Violence</li>
                    <li>⚠ Fire Hazards</li>
                    <li>⚠ Smoking Violations</li>
                    <li>⚠ Unauthorized Vehicles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">How It Works</h3>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">1</span>
                  <span>Video frames are captured from surveillance cameras or uploaded videos</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">2</span>
                  <span>YOLOv8 detects people and objects, creating bounding boxes around each entity</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">3</span>
                  <span>MediaPipe extracts 33 body keypoints to understand pose and movement</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">4</span>
                  <span>Pose features are calculated (angles, positions) and fed to the classifier</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">5</span>
                  <span>Random Forest model classifies the activity with confidence scores</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">6</span>
                  <span>Results are displayed in real-time with safety status indicators</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Alerts Section */}
        <section id="alerts" className="mb-20 glassmorphism p-10 rounded-xl scroll-mt-20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-safe to-emerald-600 p-4 rounded-xl text-white mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Safe/Unsafe Alerts</h2>
          </div>

          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Our intelligent alert system provides instant notifications when unsafe activities are detected, 
              enabling rapid response to potential security threats in park environments.
            </p>

            <div className="border-l-4 border-safe pl-6 py-2">
              <h3 className="text-xl font-semibold text-white mb-3">Alert Types</h3>
              <div className="space-y-4">
                <div className="bg-unsafe/10 border border-unsafe rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🥊</span>
                    <h4 className="text-lg font-bold text-unsafe">Fighting/Violence Detection</h4>
                  </div>
                  <p className="text-sm">
                    Identifies aggressive body movements and fighting poses. Critical for preventing 
                    injuries and maintaining park safety.
                  </p>
                </div>

                <div className="bg-unsafe/10 border border-unsafe rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🔥</span>
                    <h4 className="text-lg font-bold text-unsafe">Fire Hazard Alerts</h4>
                  </div>
                  <p className="text-sm">
                    Detects fire, smoke, or flames in park areas. Essential for rapid emergency response 
                    to prevent property damage and protect visitors.
                  </p>
                </div>

                <div className="bg-unsafe/10 border border-unsafe rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🚬</span>
                    <h4 className="text-lg font-bold text-unsafe">Smoking Violation Alerts</h4>
                  </div>
                  <p className="text-sm">
                    Identifies smoking activities in designated no-smoking areas. Helps enforce park 
                    regulations and maintain air quality.
                  </p>
                </div>

                <div className="bg-unsafe/10 border border-unsafe rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🚗</span>
                    <h4 className="text-lg font-bold text-unsafe">Vehicle Intrusion Alerts</h4>
                  </div>
                  <p className="text-sm">
                    Detects unauthorized vehicles in pedestrian-only park areas. Prevents accidents 
                    and enforces park access policies.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Alert Delivery Methods</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-accent mr-2">→</span>
                  <span><strong className="text-white">Real-time WebSocket Notifications:</strong> Instant pop-up alerts in the dashboard when unsafe activities are detected</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">→</span>
                  <span><strong className="text-white">Email Notifications:</strong> Automated emails sent to park security personnel (future feature)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">→</span>
                  <span><strong className="text-white">Alert History:</strong> Complete log of all alerts with timestamps and video evidence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">→</span>
                  <span><strong className="text-white">Confidence Scores:</strong> Each alert includes AI confidence level for accuracy assessment</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="mb-20 glassmorphism p-10 rounded-xl scroll-mt-20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-xl text-white mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Video Analytics & Reporting</h2>
          </div>

          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Comprehensive analytics dashboard provides insights into park usage patterns, safety trends, 
              and detailed reports for evidence documentation and operational planning.
            </p>

            <div className="border-l-4 border-purple-500 pl-6 py-2">
              <h3 className="text-xl font-semibold text-white mb-3">Analytics Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">📊 Usage Statistics</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Total videos processed</li>
                    <li>• Safe vs unsafe activity ratio</li>
                    <li>• Average confidence scores</li>
                    <li>• Peak activity times</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">🎯 Detection Reports</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Frame-by-frame analysis</li>
                    <li>• Activity timeline</li>
                    <li>• Confidence levels</li>
                    <li>• Bounding box coordinates</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">📹 Video Management</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Processed video storage</li>
                    <li>• Video playback with overlays</li>
                    <li>• Download capabilities</li>
                    <li>• Search and filter</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">👤 User Profiles</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Personal upload history</li>
                    <li>• Individual statistics</li>
                    <li>• Activity preferences</li>
                    <li>• Account management</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Pose Estimation Technology</h3>
              <p className="mb-4">
                Our system uses MediaPipe's advanced pose estimation to track 33 body landmarks in real-time, 
                enabling precise activity classification:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-accent/10 rounded p-2">Face keypoints (5)</div>
                <div className="bg-accent/10 rounded p-2">Shoulder landmarks (2)</div>
                <div className="bg-accent/10 rounded p-2">Elbow positions (2)</div>
                <div className="bg-accent/10 rounded p-2">Wrist coordinates (2)</div>
                <div className="bg-accent/10 rounded p-2">Hip landmarks (2)</div>
                <div className="bg-accent/10 rounded p-2">Knee positions (2)</div>
                <div className="bg-accent/10 rounded p-2">Ankle coordinates (2)</div>
                <div className="bg-accent/10 rounded p-2">Foot landmarks (4)</div>
                <div className="bg-accent/10 rounded p-2">Torso tracking (12)</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Export & Integration</h3>
              <p className="mb-3">
                Analytics data can be exported for further analysis or integrated with existing security systems:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">▸</span>
                  <span>JSON API endpoints for programmatic access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">▸</span>
                  <span>CSV export for spreadsheet analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">▸</span>
                  <span>RESTful API for third-party integrations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">▸</span>
                  <span>Database queries for custom reports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center glassmorphism p-10 rounded-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Secure Your Park?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Start using our AI-powered park safety system today and keep your public spaces secure 24/7.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/50 transition-all"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetails;
