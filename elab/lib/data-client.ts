interface QueryBuilder {
  select(columns?: string): QueryBuilder;
  insert(data: any): QueryBuilder;
  update(data: any): QueryBuilder;
  delete(): QueryBuilder;
  eq(column: string, value: any): QueryBuilder;
  in(column: string, values: any[]): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(take: number): QueryBuilder;
  single(): Promise<{ data: any; error: any }>;
  maybeSingle(): Promise<{ data: any; error: any }>;
  then(onfulfilled?: (value: { data: any; error: any }) => any): Promise<any>;
}

class DataApiClient {
  auth = {
    onAuthStateChange: (cb: any) => {
      // Mock auth state change handler
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    getUser: async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        return { data: { user: session?.user || null }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: err };
      }
    },
    getSession: async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        return { data: { session: session || null }, error: null };
      } catch (err: any) {
        return { data: { session: null }, error: err };
      }
    },
    signOut: async () => {
      await fetch("/api/auth/signout", { method: "POST" });
      return { error: null };
    }
  };

  from(table: string): QueryBuilder {
    const builder = {
      _action: "findMany",
      _where: {} as any,
      _data: null as any,
      _orderBy: [] as any[],
      _select: undefined as string | undefined,
      _take: undefined as number | undefined,

      select(columns?: string) {
        this._select = columns;
        return this;
      },
      insert(data: any) {
        this._action = "insert";
        this._data = data;
        return this;
      },
      update(data: any) {
        this._action = "update";
        this._data = data;
        return this;
      },
      delete() {
        this._action = "delete";
        return this;
      },
      eq(column: string, value: any) {
        // Translate user_id to userId to match Prisma schema
        const key = column === "user_id" ? "userId" : column === "school_id" ? "schoolId" : column === "classroom_id" ? "classroomId" : column === "student_id" ? "studentId" : column === "teacher_id" ? "teacherId" : column === "textbook_id" ? "textbookId" : column;
        this._where[key] = value;
        return this;
      },
      in(column: string, values: any[]) {
        const key = column === "user_id" ? "userId" : column === "school_id" ? "schoolId" : column === "classroom_id" ? "classroomId" : column === "student_id" ? "studentId" : column === "teacher_id" ? "teacherId" : column === "textbook_id" ? "textbookId" : column;
        this._where[key] = { in: values };
        return this;
      },
      order(column: string, options?: { ascending?: boolean }) {
        const key = column === "user_id" ? "userId" : column === "school_id" ? "schoolId" : column === "classroom_id" ? "classroomId" : column === "student_id" ? "studentId" : column === "teacher_id" ? "teacherId" : column === "textbook_id" ? "textbookId" : column;
        this._orderBy.push({ [key]: options?.ascending === false ? "desc" : "asc" });
        return this;
      },
      limit(take: number) {
        this._take = take;
        return this;
      },
      async single() {
        this._action = "findFirst";
        const res = await this._execute();
        return { data: res.data, error: res.error };
      },
      async maybeSingle() {
        this._action = "findFirst";
        const res = await this._execute();
        return { data: res.data, error: res.error };
      },
      async _execute() {
        try {
          const res = await fetch(`/api/table/${table}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: this._action,
              where: this._where,
              data: remapRequest(this._data),
              orderBy: this._orderBy.length > 0 ? this._orderBy : undefined,
              take: this._take,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Query failed");
          // Re-map camelCase properties back to snake_case for frontend components
          let mapped = json.data;
          if (Array.isArray(mapped)) {
            mapped = mapped.map(item => remapItem(item));
          } else if (mapped) {
            mapped = remapItem(mapped);
          }
          return { data: mapped, error: null };
        } catch (error: any) {
          console.error(`Data client execution failed for ${table}:`, error);
          return { data: null, error };
        }
      },
      async then(onfulfilled?: (value: { data: any; error: any }) => any) {
        const res = await this._execute();
        if (onfulfilled) return onfulfilled(res);
        return res;
      }
    };
    return builder as any;
  }

  async rpc(name: string, args?: any) {
    try {
      const urlName = name.replace(/_/g, "-");
      const res = await fetch(`/api/rpc/${urlName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args || {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "RPC failed");
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  functions = {
    invoke: async (name: string, options?: { body: any }) => {
      try {
        const urlName = name.replace(/_/g, "-");
        const res = await fetch(`/api/${urlName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options?.body || {}),
        });
        const data = await res.json();
        return { data, error: !res.ok ? new Error(data.error || "Invoke failed") : null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    }
  };

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, options?: any) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("path", path);

          const res = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Upload failed");
          return { data: json, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `/storage/${path}` } };
      }
    })
  };
}

function remapItem(item: any) {
  if (!item || typeof item !== "object") return item;
  const remapped = { ...item };
  const mappings: Record<string, string> = {
    userId: "user_id",
    schoolId: "school_id",
    classroomId: "classroom_id",
    studentId: "student_id",
    teacherId: "teacher_id",
    textbookId: "textbook_id",
    coverUrl: "cover_url",
    fileUrl: "file_url",
    totalPages: "total_pages",
    chapterNumber: "chapter_number",
    startPage: "start_page",
    endPage: "end_page",
    fullName: "full_name",
    avatarUrl: "avatar_url",
  };
  for (const [camel, snake] of Object.entries(mappings)) {
    if (remapped[camel] !== undefined) {
      remapped[snake] = remapped[camel];
    }
  }
  return remapped;
}

/** Convert the legacy UI's database-shaped payloads to Prisma field names. */
function remapRequest(value: any): any {
  if (Array.isArray(value)) return value.map(remapRequest);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  const mappings: Record<string, string> = {
    user_id: "userId", school_id: "schoolId", classroom_id: "classroomId",
    student_id: "studentId", teacher_id: "teacherId", textbook_id: "textbookId",
    experiment_id: "experimentId", created_by: "createdBy", author_id: "authorId",
    due_date: "dueDate", cover_url: "coverUrl", file_url: "fileUrl",
    total_pages: "totalPages", chapter_number: "chapterNumber",
    start_page: "startPage", end_page: "endPage", full_name: "fullName",
    avatar_url: "avatarUrl", time_spent_seconds: "timeSpentSeconds",
  };
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [mappings[key] || key, remapRequest(item)]));
}

export const dataClient = new DataApiClient();
export type DataClient = DataApiClient;
export type DataResponse<T> = { data: T | null; error: any };
export type DataSingleResponse<T> = { data: T | null; error: any };
