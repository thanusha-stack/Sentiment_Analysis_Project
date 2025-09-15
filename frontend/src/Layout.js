import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BarChart3, 
  Upload, 
  MessageSquareText, 
  Cloud, 
  FileText, 
  Home,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Welcome",
    url: createPageUrl("Welcome"),
    icon: Home,
  },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Upload Comments",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "Comment Analysis",
    url: createPageUrl("Analysis"),
    icon: MessageSquareText,
  },
  {
    title: "Word Cloud",
    url: createPageUrl("WordCloud"),
    icon: Cloud,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary-navy: #0f172a;
            --primary-blue: #1e40af;
            --accent-green: #059669;
            --accent-amber: #d97706;
            --accent-coral: #dc2626;
            --surface-light: #f8fafc;
            --surface-white: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-subtle: #e2e8f0;
          }
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, var(--surface-light) 0%, #e0e7ff 100%);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full gradient-bg">
        <Sidebar className="border-r border-gray-200 bg-white/95 backdrop-blur-sm">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">e-Consultation AI</h2>
                <p className="text-xs text-gray-500 font-medium">Policy Analysis Suite</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                Analysis Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url 
                            ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:shadow-sm'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 font-medium">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-6">
            <Link to={createPageUrl("Profile")}>
              <div className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">Profile Settings</p>
                  <p className="text-xs text-gray-500 truncate">Manage your account</p>
                </div>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">e-Consultation AI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}