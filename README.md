##  Hosting Environment Decision

### 📅 Meeting Summary
**Date:** 15/10/2025  
**Participants:** Badreddine Bouzid, Teachi Lina, Kassama Nouha, Amina Bouzenada.  
**Purpose:** Decide on the hosting environment for the **React + Express.js + MySQL** stack.

---

### 🧠 Discussion Points

#### Project Architecture
- **Frontend:** React  
- **Backend:** Express.js (Node.js)  
- **Database:** MySQL  

#### Reviewed Hosting Options
- **Frontend:** Vercel / Netlify / Render  
- **Backend:** Render / Railway  
- **Database:** PlanetScale / Aiven / OVH Server 

#### Evaluation Criteria
- Free-tier availability      
- Performance and reliability for MVP stage  
- Compatibility with Node.js + MySQL stack  

---

### ✅ Decision


#### **Option 1 – Preferred (MVP Setup)**
- **Frontend:** Render  
- **Backend:** Render (Node.js Web Service)  
- **Database:** Free MySQL hosting (e.g., PlanetScale or Aiven)  

**Reasoning:**  
- Fully cloud-based and requires no server maintenance.  
- Free tiers for both hosting and database are sufficient for early testing and MVP stage.  
- Easy integration with GitHub for automatic deployments.  
- Minimal setup and environment management effort.  


#### **Option 2 – Alternative (Low-Cost Production Setup)**
- **Frontend:** Render  
- **Backend:** Render (Node.js Web Service)  
- **Database:** MySQL hosted on **OVH VPS** (cheap server plan)  

**Reasoning:**  
- Provides more control over the database environment.  
- This option will be used if Option 1 turns out not to be fully free or becomes too complicated to configure and maintain.
