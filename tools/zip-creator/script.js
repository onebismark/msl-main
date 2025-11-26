document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const clearBtn = document.getElementById('clearBtn');
    const createBtn = document.getElementById('createBtn');
    const fileList = document.getElementById('fileList');
    const progressContainer = document.getElementById('progressContainer');
    const progress = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    const zipNameInput = document.getElementById('zipName');
    const successMessage = document.getElementById('successMessage');
    const downloadLink = document.getElementById('downloadLink');
    
    let selectedFiles = [];
    
    // Browse button click handler
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Clear button click handler
    clearBtn.addEventListener('click', function() {
        clearFiles();
    });
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#2980b9';
        uploadArea.style.backgroundColor = '#f8f9fa';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = 'white';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = 'white';
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Create zip button handler
    createBtn.addEventListener('click', function() {
        createZip();
    });
    
    // Handle selected files
    function handleFiles(files) {
        const newFiles = Array.from(files);
        
        // Check for duplicates
        newFiles.forEach(file => {
            const isDuplicate = selectedFiles.some(
                existingFile => existingFile.name === file.name && existingFile.size === file.size
            );
            
            if (!isDuplicate) {
                selectedFiles.push(file);
            }
        });
        
        updateFileList();
        updateButtonStates();
        
        // Show visual feedback
        if (newFiles.length > 0) {
            uploadArea.style.borderColor = '#2ecc71';
            setTimeout(() => {
                uploadArea.style.borderColor = '#3498db';
            }, 1000);
        }
    }
    
    // Clear all files
    function clearFiles() {
        selectedFiles = [];
        fileInput.value = '';
        updateFileList();
        updateButtonStates();
        hideSuccessMessage();
        resetProgress();
        
        // Show visual feedback
        uploadArea.style.borderColor = '#e74c3c';
        setTimeout(() => {
            uploadArea.style.borderColor = '#3498db';
        }, 800);
    }
    
    // Update the file list display
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            fileList.innerHTML = '<div class="empty-state">No files selected. Drag and drop files here or click "Browse Files"</div>';
            return;
        }
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            fileName.style.fontWeight = '500';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            
            const fileSize = document.createElement('span');
            fileSize.textContent = formatFileSize(file.size);
            fileSize.style.color = '#7f8c8d';
            fileSize.style.fontSize = '0.9rem';
            
            const fileRemove = document.createElement('span');
            fileRemove.className = 'file-remove';
            fileRemove.textContent = '✕';
            fileRemove.title = 'Remove this file';
            fileRemove.addEventListener('click', function(e) {
                e.stopPropagation();
                selectedFiles.splice(index, 1);
                updateFileList();
                updateButtonStates();
            });
            
            fileInfo.appendChild(fileSize);
            fileInfo.appendChild(fileRemove);
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileInfo);
            fileList.appendChild(fileItem);
        });
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Update button states based on conditions
    function updateButtonStates() {
        const hasFiles = selectedFiles.length > 0;
        const hasZipName = zipNameInput.value.trim() !== '';
        
        clearBtn.disabled = !hasFiles;
        createBtn.disabled = !hasFiles || !hasZipName;
        
        // Update button tooltips
        if (!hasFiles) {
            createBtn.title = 'Please select files first';
            clearBtn.title = 'No files to clear';
        } else if (!hasZipName) {
            createBtn.title = 'Please enter a zip file name';
        } else {
            createBtn.title = 'Create zip file with ' + selectedFiles.length + ' file(s)';
            clearBtn.title = 'Clear all ' + selectedFiles.length + ' file(s)';
        }
    }
    
    // Hide success message
    function hideSuccessMessage() {
        successMessage.style.display = 'none';
    }
    
    // Reset progress bar
    function resetProgress() {
        progress.style.width = '0%';
        progress.style.background = '#3498db';
        progressText.textContent = '0%';
        progressContainer.style.display = 'none';
    }
    
    // Zip name input change handler
    zipNameInput.addEventListener('input', updateButtonStates);
    
    // Create zip file using JSZip
    function createZip() {
        // Reset UI
        progressContainer.style.display = 'block';
        successMessage.style.display = 'none';
        createBtn.disabled = true;
        clearBtn.disabled = true;
        browseBtn.disabled = true;
        
        const zip = new JSZip();
        const totalFiles = selectedFiles.length;
        let processedFiles = 0;
        
        // Update progress
        function updateProgress() {
            const progressValue = (processedFiles / totalFiles) * 100;
            progress.style.width = `${progressValue}%`;
            progressText.textContent = `${Math.round(progressValue)}%`;
        }
        
        // Add files to zip with progress tracking
        const addFilesPromises = selectedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    zip.file(file.name, e.target.result);
                    processedFiles++;
                    updateProgress();
                    resolve();
                };
                
                reader.readAsArrayBuffer(file);
            });
        });
        
        // Wait for all files to be added
        Promise.all(addFilesPromises).then(() => {
            // Generate zip file with progress updates
            return zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            }, function(metadata) {
                // Update progress during generation
                if (metadata.percent) {
                    const generationProgress = 50 + (metadata.percent / 2); // Second half of progress
                    progress.style.width = `${generationProgress}%`;
                    progressText.textContent = `${Math.round(generationProgress)}%`;
                }
            });
        }).then(function(blob) {
            // Update progress to 100%
            progress.style.width = '100%';
            progressText.textContent = '100%';
            
            // Create download link
            const zipFileName = (zipNameInput.value.trim() || 'compressed') + '.zip';
            const url = URL.createObjectURL(blob);
            
            downloadLink.setAttribute('download', zipFileName);
            downloadLink.href = url;
            
            // Show success message
            successMessage.style.display = 'block';
            successMessage.innerHTML = `
                <strong>Zip file created successfully!</strong> 
                <a href="#" id="downloadLink">Download "${zipFileName}"</a>
            `;
            
            // Update the download link reference
            const newDownloadLink = document.getElementById('downloadLink');
            newDownloadLink.setAttribute('download', zipFileName);
            newDownloadLink.href = url;
            
            // Re-enable buttons
            updateButtonStates();
            browseBtn.disabled = false;
            
            // Clean up after download
            newDownloadLink.addEventListener('click', function() {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 100);
            });
        }).catch(function(error) {
            console.error('Error creating zip file:', error);
            progressText.textContent = 'Error creating zip file';
            progress.style.background = '#e74c3c';
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Error creating zip file. Please try again.';
            uploadArea.appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
            
            // Re-enable buttons
            updateButtonStates();
            browseBtn.disabled = false;
        });
    }
    
    // Initialize
    updateFileList();
    updateButtonStates();
});