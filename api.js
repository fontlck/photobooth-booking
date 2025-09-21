export const API = {
  BASE_URL: "https://script.google.com/macros/s/AKfycbxht25cVyhAEnHges1frSZ2DblJhaKBNxo1I0RSa4tbviFFfHaHWBJ0UDMD5bBGhtvm/exec",

  async list(entity) {
    const res = await fetch(`${this.BASE_URL}?entity=${entity}&action=list`);
    if (!res.ok) throw new Error('API list failed');
    return res.json();
  },

  async upsert(entity, data) {
    const res = await fetch(this.BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, action: "upsert", data })
    });
    if (!res.ok) throw new Error('API upsert failed');
    return res.json();
  },

  async remove(entity, id) {
    const res = await fetch(this.BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, action: "remove", id })
    });
    if (!res.ok) throw new Error('API remove failed');
    return res.json();
  }
};
