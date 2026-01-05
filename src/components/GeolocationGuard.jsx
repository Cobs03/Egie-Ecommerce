import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Public, Block } from '@mui/icons-material';
import { initializeGeolocationCheck, isGeoBlocked, getStoredLocation } from '../services/geolocationService';

/**
 * GeolocationGuard Component
 * Checks user location and restricts access to Philippines only
 * 
 * @param {boolean} strict - If true, block non-PH access. If false, warn only.
 * @param {ReactNode} children - Child components to render if allowed
 */
export default function GeolocationGuard({ strict = false, children }) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [location, setLocation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkGeolocation();
  }, []);

  const checkGeolocation = async () => {
    setLoading(true);
    
    try {
      const validation = await initializeGeolocationCheck(strict);
      
      setLocation(validation.location);
      setBlocked(!validation.allowed);
      
      if (!validation.allowed) {
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Geolocation check error:', error);
      // On error, allow access
      setBlocked(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verifying your location...
        </Typography>
      </Box>
    );
  }

  if (blocked && strict) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: 3,
            p: 3,
            textAlign: 'center'
          }}
        >
          <Block sx={{ fontSize: 100, color: 'error.main' }} />
          <Typography variant="h4" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            This service is only available within the Philippines.
          </Typography>
          {location && (
            <Alert severity="error" sx={{ maxWidth: 600 }}>
              <Typography variant="subtitle2" gutterBottom>
                Detected Location
              </Typography>
              <Typography variant="body2">
                Country: {location.countryName}<br />
                IP Address: {location.ip}
              </Typography>
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            If you are in the Philippines and seeing this message, please contact our support team.
          </Typography>
        </Box>

        <Dialog open={showDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Block color="error" />
            Access Restricted
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              We're sorry, but this service is currently only available to users within the Philippines.
            </Typography>
            {location && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Your detected location:
                </Typography>
                <Typography variant="body2">
                  • Country: {location.countryName}<br />
                  • IP: {location.ip}
                </Typography>
              </Box>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              If you believe this is an error or you're currently in the Philippines, 
              please contact our support team for assistance.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => window.location.href = 'mailto:support@yoursite.com'}>
              Contact Support
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Show warning for non-PH access in non-strict mode
  if (blocked && !strict) {
    return (
      <>
        <Alert 
          severity="warning" 
          sx={{ m: 2 }}
          icon={<Public />}
        >
          <Typography variant="subtitle2">
            Non-Philippines Access Detected
          </Typography>
          <Typography variant="body2">
            This service is designed for users in the Philippines. 
            Some features may not work correctly from your location: {location?.countryName}
          </Typography>
        </Alert>
        {children}
      </>
    );
  }

  // Allow access - render children
  return <>{children}</>;
}
