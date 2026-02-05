import { NextResponse } from "next/server";

export async function GET() {
  const content = `# PingRelay - WhatsApp Automation for Webinars

## Description
PingRelay automates WhatsApp messaging for webinars and online events. Send automated reminders, boost attendance rates, and engage participants before, during, and after your events.

## Key Features
- WhatsApp message automation for webinars
- Automated reminder scheduling (before, during, after events)
- Customizable message templates with variables
- Multi-webinar management
- Real-time message tracking and analytics
- Direct WhatsApp integration

## Use Cases
- Webinar reminder automation
- Event participant engagement
- Attendance rate improvement
- Post-webinar follow-up messages
- Multi-event campaign management

## Target Audience
- Webinar organizers
- Online course creators
- Digital event hosts
- Marketing professionals
- Educational institutions

## Technology
- Next.js 15 App Router
- MongoDB with Mongoose
- NextAuth v5 for authentication
- WhatsApp HTTP API (WAHA)
- TypeScript

## Available Languages
- French (fr)
- English (en)
- Spanish (es)
- Italian (it)
- German (de)

## Contact
Website: https://pingrelay.live
Support: marc.louvion@gmail.com

## SEO Keywords
whatsapp automation, webinar automation, automated messages, webinar reminders, whatsapp marketing, event engagement, automated whatsapp messages, webinar attendance, online event automation, whatsapp for webinars, automated event reminders, participant engagement, webinar marketing automation

## Last Updated
${new Date().toISOString()}
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
