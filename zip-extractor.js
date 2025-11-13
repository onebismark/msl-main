document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const extractButton = document.getElementById("extractButton");
  const clearButton = document.getElementById("clearButton");
  const downloadAllButton = document.getElementById("downloadAll");
  const fileList = document.getElementById("fileList");
  const fileInfo = document.getElementById("fileInfo");
  const dropArea = document.getElementById("dropArea");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const fileCount = document.getElementById("fileCount");

  let extractedFiles = [];
  let currentFile = null;

  // Supported file types
  const supportedFormats = [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"];

  // File type to icon mapping
  const fileIcons = {
    ".txt": "fa-file-alt",
    ".pdf": "fa-file-pdf",
    ".doc": "fa-file-word",
    ".docx": "fa-file-word",
    ".xls": "fa-file-excel",
    ".xlsx": "fa-file-excel",
    ".ppt": "fa-file-powerpoint",
    ".pptx": "fa-file-powerpoint",
    ".jpg": "fa-file-image",
    ".jpeg": "fa-file-image",
    ".png": "fa-file-image",
    ".gif": "fa-file-image",
    ".mp3": "fa-file-audio",
    ".wav": "fa-file-audio",
    ".mp4": "fa-file-video",
    ".mov": "fa-file-video",
    ".avi": "fa-file-video",
    ".html": "fa-file-code",
    ".css": "fa-file-code",
    ".js": "fa-file-code",
    ".json": "fa-file-code",
    ".zip": "fa-file-archive",
    ".rar": "fa-file-archive",
    ".7z": "fa-file-archive",
    ".tar": "fa-file-archive",
    ".gz": "fa-file-archive",
    ".bz2": "fa-file-archive"
  };

  // Check if file is supported
  function isSupportedFile(file) {
    return supportedFormats.some(format => file.name.toLowerCase().endsWith(format));
  }

  // Get file icon
  function getFileIcon(fileName) {
    const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    return fileIcons[extension] || "fa-file";
  }

  // Update file info display
  function updateFileInfo(file) {
    if (!file) {
      fileInfo.innerHTML = "";
      return;
    }
    
    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // in MB
    fileInfo.innerHTML = `
      <p><strong>Selected file:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${fileSize} MB</p>
      <p><strong>Type:</strong> ${file.type || "Unknown"}</p>
    `;
  }

  // Handle file selection
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  });

  // Handle drag and drop
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
    dropArea.style.borderColor = "#1f4037";
    dropArea.style.backgroundColor = "rgba(153, 242, 200, 0.2)";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
    dropArea.style.borderColor = "#99f2c8";
    dropArea.style.backgroundColor = "";
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    dropArea.style.borderColor = "#99f2c8";
    dropArea.style.backgroundColor = "";
    
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    handleFileSelection(file);
  });

  function handleFileSelection(file) {
    if (!file) return;
    
    if (isSupportedFile(file)) {
      currentFile = file;
      extractButton.disabled = false;
      updateFileInfo(file);
    } else {
      currentFile = null;
      extractButton.disabled = true;
      alert(`Unsupported file format. Please upload one of these: ${supportedFormats.join(", ")}`);
    }
  }

  // Clear everything
  clearButton.addEventListener("click", () => {
    fileInput.value = "";
    extractButton.disabled = true;
    fileList.innerHTML = "";
    fileInfo.innerHTML = "";
    progressContainer.style.display = "none";
    fileCount.textContent = "0 files";
    extractedFiles = [];
    currentFile = null;
  });

  // Download all files as zip
  downloadAllButton.addEventListener("click", async () => {
    if (extractedFiles.length === 0) {
      alert("No files to download");
      return;
    }

    try {
      const zip = new JSZip();
      let addedFiles = 0;
      
      // Update progress
      progressContainer.style.display = "block";
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      
      for (const file of extractedFiles) {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
        
        addedFiles++;
        const progress = Math.floor((addedFiles / extractedFiles.length) * 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
      }
      
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        progressBar.style.width = `${metadata.percent}%`;
        progressText.textContent = `${Math.floor(metadata.percent)}%`;
      });
      
      saveAs(content, "extracted_files.zip");
      progressContainer.style.display = "none";
    } catch (error) {
      alert("Error creating zip file: " + error.message);
      progressContainer.style.display = "none";
    }
  });

  // Extract files
  extractButton.addEventListener("click", async () => {
    const file = currentFile;
    if (!file) return;

    try {
      // Reset UI
      fileList.innerHTML = "";
      extractedFiles = [];
      progressContainer.style.display = "block";
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      
      // Currently only handling ZIP files with JSZip
      // In a real app, you'd need additional libraries for other formats
      if (file.name.endsWith(".zip")) {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        const files = Object.entries(contents.files);
        let processedFiles = 0;
        
        for (const [fileName, fileData] of files) {
          if (fileData.dir) continue; // Skip directories
          
          try {
            const fileContent = await zip.file(fileName).async("blob");
            const fileUrl = URL.createObjectURL(fileContent);
            
            // Add to extracted files list
            extractedFiles.push({
              name: fileName,
              url: fileUrl,
              size: fileContent.size,
              type: fileContent.type
            });
            
            // Create file row
            const fileRow = document.createElement("div");
            fileRow.classList.add("file-row");
            
            // File icon and name
            const fileInfoDiv = document.createElement("div");
            fileInfoDiv.style.display = "flex";
            fileInfoDiv.style.alignItems = "center";
            fileInfoDiv.style.flex = "1";
            
            const fileIcon = document.createElement("i");
            fileIcon.classList.add("fas", getFileIcon(fileName), "file-icon");
            
            const fileNameElement = document.createElement("p");
            fileNameElement.textContent = fileName;
            
            fileInfoDiv.appendChild(fileIcon);
            fileInfoDiv.appendChild(fileNameElement);
            
            // Download button
            const downloadButton = document.createElement("button");
            downloadButton.innerHTML = '<i class="fas fa-download"></i> Download';
            
            downloadButton.addEventListener("click", () => {
              const link = document.createElement("a");
              link.href = fileUrl;
              link.download = fileName;
              link.click();
            });
            
            // Append to file row
            fileRow.appendChild(fileInfoDiv);
            fileRow.appendChild(downloadButton);
            
            // Append row to file list
            fileList.appendChild(fileRow);
            
            // Update progress
            processedFiles++;
            const progress = Math.floor((processedFiles / files.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
          } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
          }
        }
        
        fileCount.textContent = `${extractedFiles.length} ${extractedFiles.length === 1 ? 'file' : 'files'}`;
      } else {
        alert("Currently only ZIP files are fully supported. Other formats coming soon!");
      }
    } catch (error) {
      alert("Error extracting files: " + error.message);
      console.error(error);
    } finally {
      progressContainer.style.display = "none";
    }
  });
});
