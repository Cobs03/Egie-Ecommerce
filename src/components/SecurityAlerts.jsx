import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security,
  LocationOn,
  DevicesOther,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { supabase } from '../../config/supabaseClient';

export default function SecurityAlerts() {
  const [recentLogins, setRecentLogins] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLogin, setSelectedLogin] = useState(null);

  useEffect(() => {
    loadSecurityData();
    
    // Refresh every minute
    const interval = setInterval(loadSecurityData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    // Load recent login history (last 10 logins)
    const { data: logins } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('login_time', { ascending: false })
      .limit(10);

    setRecentLogins(logins || []);

    // Load suspicious activities related to this user
    const { data: activities } = await supabase
      .from('suspicious_activities')
      .select('*')
      .eq('user_id', user.data.user.id)
      .in('status', ['detected', 'investigating'])
      .order('detected_at', { ascending: false })
      .limit(5);

    setSuspiciousActivities(activities || []);
  };

  const hasNewLocationAlerts = recentLogins.some(login => login.is_new_location);
  const hasNewDeviceAlerts = recentLogins.some(login => login.is_new_device);
  const hasSuspiciousActivity = suspiciousActivities.length > 0;

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security /> Security & Login Activity
      </Typography>

      {/* Alerts Section */}
      {(hasNewLocationAlerts || hasNewDeviceAlerts || hasSuspiciousActivity) && (
        <Box sx={{ mb: 3 }}>
          {hasNewLocationAlerts && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<LocationOn />}>
              <Typography variant="subtitle2">New Location Detected</Typography>
              <Typography variant="body2">
                We detected a login from a location you haven't used before. 
                If this wasn't you, please change your password immediately.
              </Typography>
            </Alert>
          )}

          {hasNewDeviceAlerts && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<DevicesOther />}>
              <Typography variant="subtitle2">New Device Login</Typography>
              <Typography variant="body2">
                A login from a new device was detected. Review your recent activity below.
              </Typography>
            </Alert>
          )}

          {hasSuspiciousActivity && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<Warning />}>
              <Typography variant="subtitle2">Suspicious Activity Detected</Typography>
              <Typography variant="body2">
                We've detected unusual activity on your account. Please review the details below 
                and contact support if you notice anything unfamiliar.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Recent Login History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Recent Login Activity
          </Typography>
          <List>
            {recentLogins.map((login, index) => (
              <React.Fragment key={login.id}>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedLogin(login);
                    setShowDetails(true);
                  }}
                >
                  <ListItemIcon>
                    {login.is_new_location || login.is_new_device ? (
                      <Warning color="warning" />
                    ) : (
                      <CheckCircle color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {new Date(login.login_time).toLocaleString()}
                        </Typography>
                        {login.is_new_location && (
                          <Chip label="New Location" size="small" color="warning" />
                        )}
                        {login.is_new_device && (
                          <Chip label="New Device" size="small" color="info" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" component="span" display="block">
                          {login.ip_address}
                        </Typography>
                        {login.city && login.country_code && (
                          <Typography variant="caption" component="span" display="block">
                            {login.city}, {login.country_code}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < recentLogins.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Suspicious Activities */}
      {suspiciousActivities.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Security Alerts
            </Typography>
            <List>
              {suspiciousActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color={getSeverityColor(activity.severity)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {activity.activity_type.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Chip 
                            label={activity.severity} 
                            size="small" 
                            color={getSeverityColor(activity.severity)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" component="span" display="block">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" component="span" display="block" color="text.secondary">
                            {new Date(activity.detected_at).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < suspiciousActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Activity */}
      {recentLogins.length === 0 && suspiciousActivities.length === 0 && (
        <Alert severity="success" icon={<CheckCircle />}>
          <Typography variant="subtitle2">All Clear!</Typography>
          <Typography variant="body2">
            No suspicious activity detected. Your account security looks good.
          </Typography>
        </Alert>
      )}

      {/* Login Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Login Details</DialogTitle>
        <DialogContent>
          {selectedLogin && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Time" 
                  secondary={new Date(selectedLogin.login_time).toLocaleString()} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="IP Address" 
                  secondary={selectedLogin.ip_address} 
                />
              </ListItem>
              {selectedLogin.city && (
                <ListItem>
                  <ListItemText 
                    primary="Location" 
                    secondary={`${selectedLogin.city}, ${selectedLogin.country_code}`} 
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="Device Type" 
                  secondary={selectedLogin.device_type || 'Unknown'} 
                />
              </ListItem>
              {selectedLogin.user_agent && (
                <ListItem>
                  <ListItemText 
                    primary="Browser/Device" 
                    secondary={selectedLogin.user_agent} 
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {selectedLogin.is_new_location && (
                        <Chip label="New Location" size="small" color="warning" sx={{ mr: 1 }} />
                      )}
                      {selectedLogin.is_new_device && (
                        <Chip label="New Device" size="small" color="info" />
                      )}
                      {!selectedLogin.is_new_location && !selectedLogin.is_new_device && (
                        <Chip label="Recognized" size="small" color="success" />
                      )}
                    </Box>
                  } 
                />
              </ListItem>
            </List>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            If you don't recognize this login, please change your password immediately and contact support.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
