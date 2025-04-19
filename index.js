document.getElementById("groupTabs").addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const domainGroups = {};
    let groupedCount = 0;
  
    for (let tab of tabs) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname.replace("www.", "");
        if (!domainGroups[domain]) domainGroups[domain] = [];
        domainGroups[domain].push(tab.id);
      } catch (err) {
        console.warn("Skipped tab:", tab.url);
      }
    }
  
    for (let domain in domainGroups) {
      const tabIds = domainGroups[domain];
      if (tabIds.length > 1) {
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, {
          title: domain,
          color: getRandomColor(),
        });
        groupedCount += tabIds.length;
      }
    }
  
    const ungroupedCount = tabs.length - groupedCount;
    document.getElementById("summary").textContent = `
    Grouped: ${groupedCount}
    Ungrouped: ${ungroupedCount}
    Total: ${tabs.length}
    `;
  });
  
  document.getElementById("ungroupTabs").addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const groupedTabs = tabs.filter((t) => t.groupId !== -1);
  
    for (const tab of groupedTabs) {
      await chrome.tabs.ungroup(tab.id);
    }
  
    document.getElementById("summary").textContent = `All tabs ungrouped!!`;
  });
  
  function getRandomColor() {
    const colors = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
  }