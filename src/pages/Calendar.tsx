
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ClipboardList } from "lucide-react";

// Sample task and habit data for the calendar
const sampleData = {
  "2023-07-15": {
    tasks: [
      { id: 1, title: "Team meeting", completed: true },
      { id: 2, title: "Send weekly report", completed: false }
    ],
    habits: [
      { id: 1, name: "Exercise", completed: true },
      { id: 2, name: "Read", completed: true },
      { id: 3, name: "Meditate", completed: false }
    ]
  },
  "2023-07-16": {
    tasks: [
      { id: 3, title: "Client call", completed: true }
    ],
    habits: [
      { id: 1, name: "Exercise", completed: false },
      { id: 2, name: "Read", completed: true }
    ]
  }
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("tasks");
  
  // Format date as YYYY-MM-DD to match our sample data keys
  const formattedDate = date ? 
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
    "";
  
  // Get data for the selected date
  const selectedDateData = sampleData[formattedDate] || { tasks: [], habits: [] };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-subtle">
              <CardContent className="p-6">
                <Calendar 
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="shadow-subtle h-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  {date ? date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="tasks" className="flex-1">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="habits" className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Habits
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tasks" className="mt-0">
                    {selectedDateData.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDateData.tasks.map(task => (
                          <div 
                            key={task.id}
                            className="p-3 rounded-md bg-accent/50 flex items-center justify-between"
                          >
                            <span className="text-sm">{task.title}</span>
                            {task.completed ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                Completed
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No tasks for this date</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="habits" className="mt-0">
                    {selectedDateData.habits.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDateData.habits.map(habit => (
                          <div 
                            key={habit.id}
                            className="p-3 rounded-md bg-accent/50 flex items-center justify-between"
                          >
                            <span className="text-sm">{habit.name}</span>
                            {habit.completed ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                Done
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                                Missed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No habits for this date</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
