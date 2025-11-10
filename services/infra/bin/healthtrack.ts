#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HealthTrackStack } from '../lib/healthtrack-stack';

const app = new cdk.App();

new HealthTrackStack(app, 'HealthTrackStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'HealthTrack - Unified Healthcare Record System',
});

app.synth();
